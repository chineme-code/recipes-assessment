import * as React from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Rating,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import type { Recipe } from "../types";
import { fetchRecipes, searchRecipes, type SearchFilters } from "../api";
import { RecipeDrawer } from "./RecipeDrawer";

function parseServes(serves: string | null): string {
  if (!serves) return "—";
  // Example: "8 servings" => "8"
  const m = serves.match(/\d+/);
  return m ? m[0] : serves;
}

function titleSafe(t: string | null) {
  return t && t.trim().length ? t : "—";
}

export function RecipeTable() {
  const [rows, setRows] = React.useState<Recipe[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // server-side pagination (DataGrid uses 0-based page)
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 15, // UI requirement wants 15–50 :contentReference[oaicite:18]{index=18}
  });

  // Field-level filters (mapped to /api/recipes/search) :contentReference[oaicite:19]{index=19}
  const [filters, setFilters] = React.useState<SearchFilters>({
    title: "",
    cuisine: "",
    rating: "",
    total_time: "",
    calories: "",
  });

  const filtersActive = Object.values(filters).some((v) => (v ?? "").trim().length > 0);

  // Drawer state
  const [selected, setSelected] = React.useState<Recipe | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      minWidth: 220,
      renderCell: (params) => (
        // Truncate when column is narrow :contentReference[oaicite:20]{index=20}
        <Typography noWrap title={titleSafe(params.value)}>
          {titleSafe(params.value)}
        </Typography>
      ),
    },
    { field: "cuisine", headerName: "Cuisine", flex: 1.2, minWidth: 160 },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) => (
        <Rating
          value={params.value ?? 0}
          readOnly
          precision={0.5}
          size="small"
        />
      ),
    },
    { field: "total_time", headerName: "Total Time", flex: 1, minWidth: 130,
      valueFormatter: (v) => (v.value === null || v.value === undefined ? "—" : `${v.value} min`)
    },
    {
      field: "serves",
      headerName: "Serves",
      flex: 1,
      minWidth: 120,
      valueGetter: (v) => parseServes(v.value ?? null),
    },
  ];

  // Debounced fetching (so typing in filters doesn't spam API)
  React.useEffect(() => {
    let alive = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const page = paginationModel.page + 1;
        const limit = paginationModel.pageSize;

        const data = filtersActive
          ? await searchRecipes(filters, page, limit)
          : await fetchRecipes(page, limit);

        if (!alive) return;

        setRows(data.data);
        setTotal(data.total);
      } catch (e) {
        if (!alive) return;
        setRows([]);
        setTotal(0);
      } finally {
        if (alive) setLoading(false);
      }
    }, 350);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [paginationModel.page, paginationModel.pageSize, filters, filtersActive]);

  function onFilterChange(key: keyof SearchFilters, value: string) {
    // When filters change, reset to first page for a better UX
    setPaginationModel((m) => ({ ...m, page: 0 }));
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters({ title: "", cuisine: "", rating: "", total_time: "", calories: "" });
    setPaginationModel((m) => ({ ...m, page: 0 }));
  }

  const showNoData = !loading && !filtersActive && total === 0;
  const showNoResults = !loading && filtersActive && total === 0;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Recipes
      </Typography>

      {/* Field-level filters row (uses /search) :contentReference[oaicite:21]{index=21} */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Filters (use comparisons like &lt;=400 or &gt;=4.5)
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(5, 1fr)" },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            label="Title"
            value={filters.title}
            onChange={(e) => onFilterChange("title", e.target.value)}
            placeholder="pie"
            size="small"
          />
          <TextField
            label="Cuisine"
            value={filters.cuisine}
            onChange={(e) => onFilterChange("cuisine", e.target.value)}
            placeholder="Southern"
            size="small"
          />
          <TextField
            label="Rating"
            value={filters.rating}
            onChange={(e) => onFilterChange("rating", e.target.value)}
            placeholder=">=4.5"
            size="small"
          />
          <TextField
            label="Total Time"
            value={filters.total_time}
            onChange={(e) => onFilterChange("total_time", e.target.value)}
            placeholder="<=60"
            size="small"
          />
          <TextField
            label="Calories"
            value={filters.calories}
            onChange={(e) => onFilterChange("calories", e.target.value)}
            placeholder="<=400"
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={clearFilters}>
            Clear
          </Button>
        </Box>
      </Paper>

      {/* Fallback screens (nice-to-have) :contentReference[oaicite:22]{index=22} */}
      {showNoData && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography fontWeight={700}>No data found.</Typography>
          <Typography variant="body2" color="text.secondary">
            Confirm you ingested the dataset and the API is connected.
          </Typography>
        </Paper>
      )}

      {showNoResults && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography fontWeight={700}>No results found.</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting filters or clearing them.
          </Typography>
        </Paper>
      )}

      {!showNoData && !showNoResults && (
        <Paper sx={{ height: 620, position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                zIndex: 10,
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(2px)",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            paginationMode="server"
            rowCount={total}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]} // required 15–50 :contentReference[oaicite:23]{index=23}
            onRowClick={(params) => {
              setSelected(params.row as Recipe);
              setDrawerOpen(true);
            }}
          />
        </Paper>
      )}

      <RecipeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        recipe={selected}
      />
    </Box>
  );
}
