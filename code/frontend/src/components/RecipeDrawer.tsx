import * as React from "react";
import {
  Box,
  Drawer,
  Typography,
  Divider,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { Recipe } from "../types";

const NUTRIENT_KEYS = [
  "calories",
  "carbohydrateContent",
  "cholesterolContent",
  "fiberContent",
  "proteinContent",
  "saturatedFatContent",
  "sodiumContent",
  "sugarContent",
  "fatContent",
];

function safe(val: unknown) {
  if (val === null || val === undefined || val === "") return "—";
  return String(val);
}

export function RecipeDrawer({
  open,
  onClose,
  recipe,
}: {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}) {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    // Reset expansion when switching to a different recipe
    setExpanded(false);
  }, [recipe?.id]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 360, sm: 420 }, p: 2 }}>
        {/* Header: Title + Cuisine at the top of the drawer :contentReference[oaicite:14]{index=14} */}
        <Typography variant="h6" fontWeight={700}>
          {safe(recipe?.title)}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {safe(recipe?.cuisine)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Description key/value :contentReference[oaicite:15]{index=15} */}
        <Typography variant="subtitle2" fontWeight={700}>
          Description
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
          {safe(recipe?.description)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Total Time key/value + expand for cook/prep :contentReference[oaicite:16]{index=16} */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Total Time
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">{safe(recipe?.total_time)} min</Typography>
            <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 1, pl: 1 }}>
            <Typography variant="body2">
              <b>Prep Time:</b> {safe(recipe?.prep_time)} min
            </Typography>
            <Typography variant="body2">
              <b>Cook Time:</b> {safe(recipe?.cook_time)} min
            </Typography>
          </Box>
        </Collapse>

        <Divider sx={{ my: 2 }} />

        {/* Nutrition section + small table :contentReference[oaicite:17]{index=17} */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Nutrition
        </Typography>

        <Table size="small">
          <TableBody>
            {NUTRIENT_KEYS.map((k) => (
              <TableRow key={k}>
                <TableCell sx={{ fontWeight: 600 }}>{k}</TableCell>
                <TableCell align="right">
                  {safe(recipe?.nutrients ? (recipe.nutrients as any)[k] : null)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={700}>
          Serves
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {safe(recipe?.serves)}
        </Typography>
      </Box>
    </Drawer>
  );
}
