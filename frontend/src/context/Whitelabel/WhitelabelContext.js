import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../../services/api";

const defaults = {
  name: "SinapCRM",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#682ee2",
  secondaryColor: "#ff5722",
};

export const WhitelabelContext = createContext({
  ...defaults,
  reload: () => {},
});

export const WhitelabelProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem("wl_config");
      return stored ? JSON.parse(stored) : defaults;
    } catch {
      return defaults;
    }
  });

  const applyConfig = (data) => {
    const next = { ...defaults, ...data };
    setConfig(next);
    localStorage.setItem("wl_config", JSON.stringify(next));

    // favicon dinâmico — remove todos existentes e recria para forçar atualização
    if (next.faviconUrl) {
      const backendUrl = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
      const faviconHref = `${backendUrl}${next.faviconUrl}?t=${Date.now()}`;
      document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconHref;
      document.head.appendChild(link);
      const shortcut = document.createElement("link");
      shortcut.rel = "shortcut icon";
      shortcut.href = faviconHref;
      document.head.appendChild(shortcut);
    }

    // título da aba
    if (next.name) document.title = next.name;

    // notifica ThemeProvider para re-ler localStorage
    window.dispatchEvent(new CustomEvent("whitelabel:updated", { detail: next }));
  };

  const reload = async () => {
    try {
      const { data } = await api.get("/whitelabel");
      applyConfig(data);
    } catch {
      // falha silenciosa — usa o que está no localStorage
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WhitelabelContext.Provider value={{ ...config, reload }}>
      {children}
    </WhitelabelContext.Provider>
  );
};

export const useWhitelabel = () => useContext(WhitelabelContext);
