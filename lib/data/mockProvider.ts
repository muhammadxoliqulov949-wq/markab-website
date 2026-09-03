import { productCategories, products } from './fixtures/products';
import { vehicles } from './fixtures/vehicles';
import { academyCategories, faqItems, lessons } from './fixtures/academy';
import {
  appFeatures,
  financingSteps,
  howItWorks,
  investorFlow,
  trustBadges,
  valueProps,
} from './fixtures/content';
import { loyaltyProgram } from './fixtures/loyalty';
import { investmentProfile } from './fixtures/investment';
import { empty, notFound, success, unavailable } from './types';
import type {
  CatalogueSearchResults,
  FaqItem,
  Lesson,
  LessonCategory,
  LessonQuery,
  LoyaltyProgram,
  Paginated,
  Product,
  ProductFacets,
  ProductQuery,
  Result,
  SearchHit,
  SiteContent,
  Vehicle,
  VehicleFacets,
  VehicleQuery,
  InvestmentProfile,
} from './types';
import type { AccountSnapshot } from '../account/types';
import type { DataAdapter } from './adapter';
import { paginate } from './paginate';
import { applyVehicleFilters } from '../vehicles/applyQuery';
import { applyProductFilters } from '../products/applyQuery';
import { searchCatalogueRecords } from '../search/catalogue';
import { deriveVehicleFacets } from '../vehicles/facets';
import { deriveProductFacets } from '../products/facets';




/**
 * Fixture provider.
 *
 * Data provenance is documented in each fixture file. No value here is invented:
 * anything that was not publicly published is `null` or omitted, and the UI
 * renders it as a pending/integration state.
 */
export const mockProvider: DataAdapter = {
  name: 'mock',

  async listVehicles(query: VehicleQuery = {}): Promise<Result<Paginated<Vehicle>>> {
    const filtered = applyVehicleFilters(vehicles, query);
    if (filtered.length === 0) return empty<Paginated<Vehicle>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  async getVehicleBySlug(slug: string): Promise<Result<Vehicle>> {
    const vehicle = vehicles.find((v) => v.slug === slug);
    return vehicle ? success(vehicle) : notFound<Vehicle>();
  },

  /**
   * Facet counts are computed from the same records the marketplace lists, so
   * the UI can never offer a filter value that returns zero results.
   */
  async getVehicleFacets(): Promise<Result<VehicleFacets>> {
    const facets = deriveVehicleFacets(vehicles);
    return facets ? success(facets) : empty<VehicleFacets>();
  },

  async listProducts(query: ProductQuery = {}): Promise<Result<Paginated<Product>>> {
    const filtered = applyProductFilters(products, query);
    if (filtered.length === 0) return empty<Paginated<Product>>();
    return success(paginate(filtered, query.page, query.pageSize));
  },

  async getProductById(id: string): Promise<Result<Product>> {
    const product = products.find((p) => p.id === id);
    return product ? success(product) : notFound<Product>();
  },

  async getProductFacets(): Promise<Result<ProductFacets>> {
    // Category labels come from the fixture's own catalogue definition, so the
    // UI never has to hard-code a translation.
    const facets = deriveProductFacets(products, (id) => productCategories.find((entry) => entry.id === id)?.name ?? id);
    return facets ? success(facets) : empty<ProductFacets>();
  },

  async getFeatured() {
    return success({
      vehicles: [...vehicles].sort((a, b) => b.views - a.views).slice(0, 3),
      products: [...products].sort((a, b) => b.views - a.views).slice(0, 3),
    });
  },

  async listLessons(query?: LessonQuery): Promise<Result<Lesson[]>> {
    let items = [...lessons];

    if (query?.category) {
      items = items.filter((lesson) => lesson.category === query.category);
    }

    if (query?.q) {
      const needle = query.q.trim().toLowerCase();
      if (needle) {
        items = items.filter((lesson) =>
          // Searched against fields that actually exist. Category is matched by
          // its display name too, so "moliya" finds the financing lessons.
          [lesson.title, lesson.category, categoryName(lesson.category)]
            .join(' ')
            .toLowerCase()
            .includes(needle),
        );
      }
    }

    // Deterministic order: category, then title. Never "relevance" — there is
    // no ranking model behind this and the prototype will not imply one.
    items.sort(
      (a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title),
    );

    return items.length ? success(items) : empty<Lesson[]>();
  },

  async getLessonBySlug(slug: string): Promise<Result<Lesson>> {
    const lesson = lessons.find((l) => l.slug === slug);
    return lesson ? success(lesson) : notFound<Lesson>();
  },

  async getLessonCategories(): Promise<Result<LessonCategory[]>> {
    // Derived from the lessons that exist, so a category with no lessons is
    // never offered as a filter.
    const counts = new Map<string, number>();
    for (const lesson of lessons) {
      counts.set(lesson.category, (counts.get(lesson.category) ?? 0) + 1);
    }

    const items: LessonCategory[] = academyCategories
      .filter((category) => counts.has(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description ?? null,
        count: counts.get(category.id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return items.length ? success(items) : empty<LessonCategory[]>();
  },

  async listRelatedLessons(slug: string, limit = 3): Promise<Result<Lesson[]>> {
    const current = lessons.find((lesson) => lesson.slug === slug);
    if (!current) return notFound<Lesson[]>();

    const others = lessons.filter((lesson) => lesson.slug !== slug);

    // Deterministic scoring from real metadata only: shared category first,
    // then shared topic tags, then alphabetical. No randomness, no model, and
    // the UI must not call the output a recommendation.
    const scored = others
      .map((lesson) => {
        let score = 0;
        if (lesson.category === current.category) score += 10;
        const shared = lesson.topics.filter((topic) => current.topics.includes(topic)).length;
        score += shared * 5;
        return { lesson, score };
      })
      .sort(
        (a, b) => b.score - a.score || a.lesson.title.localeCompare(b.lesson.title),
      )
      .slice(0, limit)
      .map((entry) => entry.lesson);

    return scored.length ? success(scored) : empty<Lesson[]>();
  },

  async getSiteContent(): Promise<Result<SiteContent>> {
    return success<SiteContent>({
      valueProps,
      howItWorks,
      financingSteps,
      investorFlow,
      appFeatures,
      trustBadges,
    });
  },

  async listFaq(): Promise<Result<FaqItem[]>> {
    return faqItems.length ? success(faqItems) : empty<FaqItem[]>();
  },

  /**
   * Investment profile.
   *
   * The published half comes from the fixture (which only contains wording that
   * appears in Markab's own public material). The pending half is a fixed list
   * of the fields a person needs before investing — every one of them null,
   * because none of them is published.
   */
  /**
   * Deliberately `unavailable`.
   *
   * The fixtures describe public catalogue data, not a customer. There is no
   * real person behind this prototype, so there is no account to return — and
   * inventing one would put fake private data on screen. Demo rows live in
   * `lib/account/demo.ts`, behind an explicit, labelled demo mode.
   */
  async getLoyaltyProgram(): Promise<Result<LoyaltyProgram>> {
    return success(loyaltyProgram);
  },

  async searchCatalogue(
    query: string,
    limitPerKind = 6,
  ): Promise<Result<CatalogueSearchResults>> {
    const results = searchCatalogueRecords({ vehicles, products }, query, limitPerKind);
    return results ? success<CatalogueSearchResults>(results) : empty<CatalogueSearchResults>();
  },

  async getAccountSnapshot(): Promise<Result<AccountSnapshot>> {
    return unavailable();
  },

  async getInvestmentProfile(): Promise<Result<InvestmentProfile>> {
    return success({
      ...investmentProfile,
      // The published model description is Markab's own three-step diagram.
      modelTitle: investorFlow.title,
      modelSteps: investorFlow.steps,
    });
  },
};

/** Category display name, used by lesson search so it matches what users see. */
function categoryName(id: string): string {
  return academyCategories.find((category) => category.id === id)?.name ?? '';
}





