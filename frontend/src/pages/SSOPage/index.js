import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import api from "../../services/api";

// Página de aterrissagem do SSO — nunca é exibida ao usuário.
// Lê os params do hash (#token=...&refreshToken=...&user=...),
// salva no localStorage exatamente como o handleLogin faz,
// e redireciona pro dashboard.
export default function SSOPage() {
  const history = useHistory();

  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove o '#'
    const params = new URLSearchParams(hash);

    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const userRaw = params.get("user");
    const ssoError = new URLSearchParams(window.location.search).get("sso_error");

    if (ssoError || !token || !userRaw) {
      history.replace("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch {
      history.replace("/login");
      return;
    }

    const { id: userId, companyId, company } = user;
    const dueDate = company?.dueDate
      ? moment(company.dueDate).format("DD/MM/yyyy")
      : "";

    localStorage.setItem("token", JSON.stringify(token));
    localStorage.setItem("companyId", companyId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("companyDueDate", dueDate);
    localStorage.setItem("cshow", null);
    localStorage.setItem("wsAvatarUrl", user.avatarUrl || "");

    // Configura o axios para usar o token nas próximas requisições
    api.defaults.headers.Authorization = `Bearer ${token}`;

    // Reload completo para garantir que o Auth context re-leia o localStorage
    window.location.href = "/tickets";
  }, []);

  return null;
}
