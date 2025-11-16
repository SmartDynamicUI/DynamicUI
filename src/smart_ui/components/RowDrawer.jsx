import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function RowDrawer({ open, onClose, row, schema }) {
  if (!row || !schema) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: '50%', padding: 2 }}>

        <Typography variant="h6" sx={{ mb: 2 }}>
          تفاصيل السجل
        </Typography>

        {schema.columns.map((col) => (
          <Box key={col.name} sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: "bold" }}>
              {col.comment || col.name}
            </Typography>
            <Typography color="text.secondary">
              {String(row[col.name] ?? "")}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}

      </Box>
    </Drawer>
  );
}
