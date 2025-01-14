import { useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { useLockFn, useSetState } from "ahooks";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Settings } from "@mui/icons-material";
import { createProfile } from "@/services/cmds";
import Notice from "../base/base-notice";
import FileInput from "./file-input";

interface Props {
  open: boolean;
  onClose: () => void;
}

// create a new profile
// remote / local file / merge / script
const ProfileNew = (props: Props) => {
  const { open, onClose } = props;

  const { mutate } = useSWRConfig();
  const [form, setForm] = useSetState({
    type: "remote",
    name: "",
    desc: "",
    url: "",
  });

  const [showOpt, setShowOpt] = useState(false);
  // can add more option
  const [option, setOption] = useSetState({ user_agent: "" });
  // file input
  const fileDataRef = useRef<string | null>(null);

  const onCreate = useLockFn(async () => {
    if (!form.type) {
      Notice.error("`Type` should not be null");
      return;
    }

    try {
      const name = form.name || `${form.type} file`;

      if (form.type === "remote" && !form.url) {
        throw new Error("The URL should not be null");
      }

      const option_ = form.type === "remote" ? option : undefined;
      const item = { ...form, name, option: option_ };
      const fileData = form.type === "local" ? fileDataRef.current : null;

      await createProfile(item, fileData);

      setForm({ type: "remote", name: "", desc: "", url: "" });
      setOption({ user_agent: "" });
      setShowOpt(false);
      fileDataRef.current = null;

      mutate("getProfiles");
      onClose();
    } catch (err: any) {
      Notice.error(err.message || err.toString());
    }
  });

  const textFieldProps = {
    fullWidth: true,
    size: "small",
    margin: "normal",
    variant: "outlined",
  } as const;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 0.5 }}>Create Profile</DialogTitle>

      <DialogContent sx={{ width: 336, pb: 1 }}>
        <FormControl size="small" fullWidth sx={{ mt: 2, mb: 1 }}>
          <InputLabel>Type</InputLabel>
          <Select
            autoFocus
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ type: e.target.value })}
          >
            <MenuItem value="remote">Remote</MenuItem>
            <MenuItem value="local">Local</MenuItem>
            <MenuItem value="script">Script</MenuItem>
            <MenuItem value="merge">Merge</MenuItem>
          </Select>
        </FormControl>

        <TextField
          {...textFieldProps}
          label="Name"
          autoComplete="off"
          value={form.name}
          onChange={(e) => setForm({ name: e.target.value })}
        />

        <TextField
          {...textFieldProps}
          label="Descriptions"
          autoComplete="off"
          value={form.desc}
          onChange={(e) => setForm({ desc: e.target.value })}
        />

        {form.type === "remote" && (
          <TextField
            {...textFieldProps}
            label="Subscription Url"
            autoComplete="off"
            value={form.url}
            onChange={(e) => setForm({ url: e.target.value })}
          />
        )}

        {form.type === "local" && (
          <FileInput onChange={(val) => (fileDataRef.current = val)} />
        )}

        {showOpt && (
          <TextField
            {...textFieldProps}
            label="User Agent"
            autoComplete="off"
            value={option.user_agent}
            onChange={(e) => setOption({ user_agent: e.target.value })}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, position: "relative" }}>
        {form.type === "remote" && (
          <IconButton
            size="small"
            sx={{ position: "absolute", left: 18 }}
            onClick={() => setShowOpt((o) => !o)}
          >
            <Settings />
          </IconButton>
        )}

        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreate} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileNew;
