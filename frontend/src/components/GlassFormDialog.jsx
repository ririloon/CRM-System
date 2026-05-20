import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

function GlassFormDialog({
  open,
  onClose,
  title,
  subtitle,
  saveText = "Save",
  onSave,
  children,
  maxWidth = "sm",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.10)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 3,
            color: "#475569",
            px: 2,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            borderRadius: 3,
            px: 2.5,
            boxShadow: "none",
          }}
        >
          {saveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GlassFormDialog;