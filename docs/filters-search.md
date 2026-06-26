# 🔎 Filtering, Search and Sorting

The MoveOn platform allows users to browse the product catalog using filters, search, and sorting options.

These features make it easier to find the right sports shoes quickly.

All filtering, searching, and sorting are handled by the backend through the `/products` endpoint using query parameters.

---

## 🎛️ Filters

Users can filter products by different attributes:

| Filter | Description |
|-------|-------------|
| Brand | Filter by shoe brand (Nike, Adidas, Asics, etc.) |
| Gender | Men, Women, Kids |
| Surface | Road, Trail, Indoor |
| Price Range | Minimum and maximum price |
| Rating | Minimum rating |

### Example Filter Request

```http
GET /products?brand=nike&gender=MEN&priceMin=5000&priceMax=15000
```

This request returns:
- Nike shoes
- For men
- Price between 50€ and 150€

---

## 🔍 Search

Users can search products by text using the search bar.

Search works on:
- Product name
- Brand name
- Category name

Search suggestions are provided using:

```http
GET /search/suggestions?query=nike
```

This endpoint returns:
- Matching products
- Matching brands
- Matching categories

The search suggestions are used for the autocomplete dropdown in the search bar.

---

## ↕️ Sorting

Products can be sorted by different fields:

| Sort Option | Description |
|-------------|-------------|
| price | Sort by price |
| rating | Sort by rating |
| createdAt | Newest products |
| relevance | Best match for search |

### Example Sorting Requests

Sort by price ascending:

```http
GET /products?sortBy=price&sortOrder=asc
```

Sort by rating descending:

```http
GET /products?sortBy=rating&sortOrder=desc
```

---

## ⭐ Relevance Sorting

**Relevance sorting is only enabled when the user types something in the search bar.**

If the user searches for:

```text
nike running
```

The backend ranks results based on:
- Product name match
- Brand match
- Category match
- Keyword matches in attributes

The most relevant products appear first.

If there is **no search query**, relevance sorting is disabled and default sorting is used.

---

## 🧠 Summary

| Feature | Endpoint |
|--------|----------|
| Filters | /products |
| Sorting | /products |
| Search Suggestions | /search/suggestions |
| Product Details | /products/:slug |

All product browsing features are handled through query parameters on the `/products` endpoint, making the catalog flexible and scalable.