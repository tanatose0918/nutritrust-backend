import { ProductModel } from '../models/Product';
import { BrandModel } from '../models/Brand';
import { IngredientModel } from '../models/Ingredient';
import { ProviderModel } from '../models/Provider';
import { EvidenceModel } from '../models/Evidence';
import { ProductAnalyticsModel } from '../models/ProductAnalytics';

class BatchCacheWorker {
  private productCache: Map<string, any> = new Map();
  private lastPrecomputeTime: Date | null = null;

  /**
   * Pre-compute compound populate JSON payloads for all products
   * Achieves sub-10ms API response time
   */
  public async precomputeProductPayloads(): Promise<number> {
    try {
      console.log('⚡ [BatchCacheWorker] Pre-computing product populate payloads...');
      const products = await ProductModel.find().lean();
      if (products.length === 0) return 0;

      const brandIds = Array.from(new Set(products.map((p) => p.brand_id)));
      const allIngredientItems = products.flatMap((p) => p.ingredient_list || []);
      const ingredientIds = Array.from(new Set(allIngredientItems.map((item) => item.igd_id)));
      const allEvidenceIds = Array.from(new Set(products.flatMap((p) => p.evidence_ids || [])));

      const [brands, ingredients, evidences, analyticsList] = await Promise.all([
        BrandModel.find({ id: { $in: brandIds } }).lean(),
        IngredientModel.find({ id: { $in: ingredientIds } }).lean(),
        allEvidenceIds.length > 0
          ? EvidenceModel.find({
              $or: [
                { evidence_id: { $in: allEvidenceIds } },
                { id: { $in: allEvidenceIds } }
              ]
            }).lean()
          : Promise.resolve([]),
        ProductAnalyticsModel.find().lean()
      ]);

      const brandMap = new Map(brands.map((b) => [b.id, b]));
      const ingredientMap = new Map(ingredients.map((ing) => [ing.id, ing]));
      const analyticsMap = new Map(analyticsList.map((a) => [a.product_id, a]));

      const providerIds = Array.from(
        new Set([
          ...brands.flatMap((b) => b.provider_list || []),
          ...ingredients.map((ing) => ing.provider_id)
        ])
      );

      const providers = providerIds.length > 0
        ? await ProviderModel.find({ id: { $in: providerIds } }).lean()
        : [];
      const providerMap = new Map(providers.map((pr) => [pr.id, pr]));

      this.productCache.clear();

      products.forEach((product) => {
        const brand = brandMap.get(product.brand_id) || null;
        const prodIngredients = (product.ingredient_list || []).map((item) => {
          const ing = ingredientMap.get(item.igd_id);
          return {
            igd_id: item.igd_id,
            volume: item.volume,
            name: ing?.name || item.igd_id,
            provider: ing?.provider_id ? providerMap.get(ing.provider_id) || null : null
          };
        });
        const analytics = analyticsMap.get(product.id) || null;
        const prodEvidences = evidences.filter(
          (ev) =>
            product.evidence_ids &&
            (product.evidence_ids.includes(ev.evidence_id) || (ev.id ? product.evidence_ids.includes(ev.id) : false))
        );

        const cachedPayload = {
          ...product,
          brand,
          ingredients: prodIngredients,
          providers,
          evidences: prodEvidences,
          analytics
        };

        this.productCache.set(product.id, cachedPayload);
        if (product._id) {
          this.productCache.set(String(product._id), cachedPayload);
        }
      });

      this.lastPrecomputeTime = new Date();
      console.log(`✅ [BatchCacheWorker] Cached ${products.length} product payloads at ${this.lastPrecomputeTime.toISOString()}`);
      return products.length;
    } catch (err) {
      console.error('❌ [BatchCacheWorker Error]:', err);
      return 0;
    }
  }

  public getCachedProduct(id: string): any | null {
    return this.productCache.get(id) || null;
  }

  public isCacheWarm(): boolean {
    return this.productCache.size > 0;
  }
}

export const batchCacheWorker = new BatchCacheWorker();
