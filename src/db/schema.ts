import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  double,
  int,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const address = mysqlTable("address", {
  id: int("id").notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  countryId: int("country_id"),
  townId: int("town_id"),
});

export const addressRelations = relations(address, ({ one }) => ({
  country: one(country, {
    fields: [address.countryId],
    references: [country.id],
  }),
  town: one(town, {
    fields: [address.townId],
    references: [town.id],
  }),
}));

export const alias = mysqlTable("alias", {
  id: int("id").notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  presenter: varchar("presenter", { length: 128 }).notNull(),
  paramId: varchar("param_id", { length: 8 }).notNull(),
  oneWay: boolean("one_way").notNull(),
});

export const category = mysqlTable("category", {
  id: int("id").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  parentId: int("parent_id"),
  alias: varchar("alias", { length: 255 }),
  sortOrder: int("sort_order").notNull(),
  shortAlias: varchar("short_alias", { length: 255 }),
  htmlHeadAttributesId: int("html_head_attributes_id"),
  active: boolean("active").notNull(),
  hiddenForUsers: boolean("hidden_for_users").notNull(),
});

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "parent_category",
  }),
  children: many(category, {
    relationName: "parent_category",
  }),
  placeCategories: many(placeCategory),
}));

// checked
export const categoryParameter = mysqlTable("category_parameter", {
  id: int("id").notNull(),
  categoryId: int("category_id"),
  parameterId: int("parameter_id"),
  sortOrder: int("sort_order").notNull(),
});

// checked
export const country = mysqlTable("country", {
  id: int("id").notNull(),
  isoCode: varchar("iso_code", { length: 2 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
});

export const countryRelations = relations(country, ({ many }) => ({
  addresses: many(address),
  counties: many(county),
}));

// checked
export const county = mysqlTable("county", {
  id: int("id").notNull(),
  countryId: int("country_id"),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 1 }).notNull(),
  alias: varchar("alias", { length: 128 }).notNull(),
});

export const countyRelations = relations(county, ({ one, many }) => ({
  country: one(country, {
    fields: [county.countryId],
    references: [country.id],
  }),
  districts: many(district),
}));

// checked
export const district = mysqlTable("district", {
  id: int("id").notNull(),
  countyId: int("county_id"),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 3 }),
  alias: varchar("alias", { length: 128 }).notNull(),
});

export const districtRelations = relations(district, ({ one, many }) => ({
  county: one(county, {
    fields: [district.countyId],
    references: [county.id],
  }),
  towns: many(town),
}));

// checked
export const parameter = mysqlTable("parameter", {
  id: int("id").notNull(),
  alias: varchar("alias", { length: 255 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(),
  options: text("options").notNull(),
  description: text("description").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  sortOrder: int("sort_order").notNull(),
});

// checked
export const parameterOption = mysqlTable("parameter_option", {
  id: int("id").notNull(),
  parameterId: int("parameter_id"),
  name: varchar("name", { length: 128 }).notNull(),
  sortOrder: int("sort_order").notNull(),
});

export const place = mysqlTable("place", {
  id: int("id").notNull(),
  alias: varchar("alias", { length: 255 }).notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  locationLat: double("location_lat"),
  locationLng: double("location_lng"),
  visibleInCatalog: boolean("visible_in_catalog").notNull(),
  visibleInMap: boolean("visible_in_map").notNull(),
  addressId: int("address_id"),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at"),
  bookingUrl: varchar("booking_url", { length: 255 }).notNull(),
  publicEmail: varchar("public_email", { length: 64 }).notNull(),
  adminEmail: varchar("admin_email", { length: 64 }).notNull(),
  companyRegistrationNumber: varchar("company_registration_number", {
    length: 16,
  }).notNull(),
  addressInstructions: text("address_instructions").notNull(),
  internalNote: text("internal_note").notNull(),
  externalReferences: text("external_references").notNull(),
  additionalEmails: text("additional_emails").notNull(),
  additionalWebsites: text("additional_websites").notNull(),
  eduid: varchar("eduid", { length: 9 }).notNull(),
  active: int("active").notNull(),
});

// checked
export const placeParameterValue = mysqlTable("place_parameter_value", {
  id: int("id").notNull(),
  placeId: int("place_id"),
  parameterId: int("parameter_id"),
  value: varchar("value", { length: 255 }).notNull(),
});

export const placeRelations = relations(place, ({ one, many }) => ({
  address: one(address, {
    fields: [place.addressId],
    references: [address.id],
  }),
  placeCategories: many(placeCategory),
}));

export const placeCategory = mysqlTable("place_category", {
  placeId: int("place_id").notNull(),
  categoryId: int("category_id").notNull(),
});

export const placeCategoryRelations = relations(placeCategory, ({ one }) => ({
  place: one(place, {
    fields: [placeCategory.placeId],
    references: [place.id],
  }),
  category: one(category, {
    fields: [placeCategory.categoryId],
    references: [category.id],
  }),
}));

// checked
export const town = mysqlTable("town", {
  id: int("id").notNull(),
  districtId: int("district_id"),
  name: varchar("name", { length: 128 }).notNull(),
  code: varchar("code", { length: 9 }),
  alias: varchar("alias", { length: 128 }).notNull(),
});

export const townRelations = relations(town, ({ one, many }) => ({
  district: one(district, {
    fields: [town.districtId],
    references: [district.id],
  }),
  addresses: many(address),
}));
