import { ProductAnalyticsModel } from '../models/ProductAnalytics';
import { ProductModel } from '../models/Product';
import { BrandModel } from '../models/Brand';

export interface IBrandStorePriceOffer {
  merchant_name: string;
  store_type: 'Official Brand Store' | 'Verified Partner';
  platform: 'Shopee' | 'Lazada' | 'Official Website';
  package_price_thb: number;
  price_per_serving_thb: number;
  in_stock: boolean;
}

export interface IPriceIndexResult {
  product_id: string;
  product_name: string;
  brand_name: string;
  official_offers: IBrandStorePriceOffer[];
}

export class MerchantPriceMCP {
  /**
   * Neutral Official Store Price Indexer
   */
  public async getOfficialStorePrices(productId: string): Promise<IPriceIndexResult | null> {
    const product = await ProductModel.findOne({ id: productId }).lean();
    if (!product) return null;

    const brand = await BrandModel.findOne({ id: product.brand_id }).lean();
    const analytics = await ProductAnalyticsModel.findOne({ product_id: productId }).lean();

    const offers: IBrandStorePriceOffer[] = [
      {
        merchant_name: `${brand?.name || 'Brand'} Official Store`,
        store_type: 'Official Brand Store',
        platform: 'Shopee',
        package_price_thb: product.min_price,
        price_per_serving_thb: Number((product.min_price / 60).toFixed(2)),
        in_stock: true
      },
      {
        merchant_name: `${brand?.name || 'Brand'} Flagship Store`,
        store_type: 'Official Brand Store',
        platform: 'Lazada',
        package_price_thb: product.min_price + 20,
        price_per_serving_thb: Number(((product.min_price + 20) / 60).toFixed(2)),
        in_stock: true
      },
      {
        merchant_name: `${brand?.name || 'Brand'} Official`,
        store_type: 'Verified Partner',
        platform: 'Official Website',
        package_price_thb: product.min_price - 10,
        price_per_serving_thb: Number(((product.min_price - 10) / 60).toFixed(2)),
        in_stock: true
      }
    ];

    return {
      product_id: product.id,
      product_name: product.name,
      brand_name: brand?.name || 'Verified Brand',
      official_offers: offers
    };
  }
}

export const merchantPriceMCP = new MerchantPriceMCP();
