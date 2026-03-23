const App = (() => {
  const fmtCNY = (n) =>
    new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      maximumFractionDigits: 2,
    }).format(n);

  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  const seeded = (() => {
    // 简单可复现的伪随机，避免每次刷新数据完全不同
    let s = 20260312;
    return () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  })();

  const pick = (arr) => arr[Math.floor(seeded() * arr.length)];

  const genOrders = () => {
    const statuses = [
      { key: "paid", name: "已支付" },
      { key: "pending", name: "待支付" },
      { key: "cancelled", name: "已取消" },
    ];
    const flowStatuses = [
      { key: "processing", name: "正在处理" },
      { key: "success", name: "交易成功" },
      { key: "failed", name: "交易失败" },
      { key: "waiting", name: "等待领取" },
      { key: "receive_failed", name: "领取失败" },
      { key: "risk", name: "风控订单" },
    ];
    const channels = ["官网", "API", "分销", "批量导入"];
    const games = ["王者荣耀", "原神", "和平精英", "DNF", "崩坏：星穹铁道"];
    const payWays = ["微信", "支付宝", "银行卡", "余额"];
    const customers = ["星云科技", "蓝鲸互娱", "风铃工作室", "猫爪商贸", "霓虹网络", "极光游戏店"];
    const products = [
      { title: "手游点券-快速到账", codePrefix: "SP100" },
      { title: "端游点券-官方直充", codePrefix: "SP200" },
      { title: "礼包卡密-自动发货", codePrefix: "SP300" },
      { title: "代充服务-人工处理", codePrefix: "SP400" },
    ];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const orders = [];
    for (let i = 0; i < 64; i++) {
      const st = pick(statuses);
      const amount = Math.round((20 + seeded() * 980) * 100) / 100;
      const coins = Math.round(amount * (8 + seeded() * 12));
      const createdAt = new Date(now - Math.floor(seeded() * 14) * dayMs - Math.floor(seeded() * dayMs));
      const id = `GC${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(
        createdAt.getDate()
      ).padStart(2, "0")}${String(10000 + i).slice(-4)}`;

      const product = products[Math.floor(seeded() * products.length)];
      const productCode = `${product.codePrefix}${String(1000 + i).slice(-3)}`;

      // 依据支付状态大致分配流程状态
      let flow;
      if (st.key === "paid") {
        flow = seeded() > 0.6 ? flowStatuses.find((f) => f.key === "success") : flowStatuses.find((f) => f.key === "waiting");
      } else if (st.key === "pending") {
        flow = seeded() > 0.7 ? flowStatuses.find((f) => f.key === "processing") : flowStatuses.find((f) => f.key === "waiting");
      } else {
        flow = seeded() > 0.5 ? flowStatuses.find((f) => f.key === "failed") : flowStatuses.find((f) => f.key === "risk");
      }

      orders.push({
        id,
        productTitle: product.title,
        productCode,
        status: st.key,
        statusName: st.name,
        flowStatus: flow.key,
        flowStatusName: flow.name,
        createdAt: createdAt.toISOString(),
        customer: pick(customers),
        game: pick(games),
        channel: pick(channels),
        payWay: pick(payWays),
        amount,
        coins,
        fee: Math.round(amount * (0.01 + seeded() * 0.015) * 100) / 100,
        note: seeded() > 0.7 ? "自动发货" : "人工审核",
      });
    }
    // 最新靠前
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return orders;
  };

  const state = {
    orders: genOrders(),
  };

  const statusToBadgeClass = (k) =>
    k === "paid" ? "paid" : k === "pending" ? "pending" : "cancelled";

  const flowStatusToBadgeClass = (k) => {
    if (k === "success") return "flow-success";
    if (k === "processing") return "flow-processing";
    if (k === "failed") return "flow-failed";
    if (k === "receive_failed") return "flow-receive_failed";
    if (k === "waiting") return "flow-waiting";
    if (k === "risk") return "flow-risk";
    return "";
  };

  const el = (sel) => document.querySelector(sel);

  const showToast = (text) => {
    let t = el("#appToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "appToast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      t.classList.remove("show");
    }, 1800);
  };

  function mountNavActive() {
    const cur = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const nav = a.dataset.nav;
      const match = nav === cur || (nav === "products" && cur === "product_list");
      if (match) a.classList.add("active");
      else a.classList.remove("active");
    });
    if (cur === "orders") {
      const h = (location.hash || "").replace("#", "") || "list";
      const key = ["list", "site", "manual", "supplement"].includes(h) ? h : "list";
      document.querySelectorAll("[data-orders-subnav]").forEach((a) => {
        a.classList.toggle("active", a.dataset.ordersSubnav === key);
      });
    }
    if (cur === "shop") {
      document.querySelectorAll("[data-shop-subnav]").forEach((a) => {
        a.classList.add("active");
      });
    } else {
      document.querySelectorAll("[data-shop-subnav]").forEach((a) => {
        a.classList.remove("active");
      });
    }
    if (cur === "products" || cur === "product_list") {
      document.querySelectorAll("[data-products-subnav]").forEach((a) => {
        a.classList.add("active");
      });
    } else {
      document.querySelectorAll("[data-products-subnav]").forEach((a) => {
        a.classList.remove("active");
      });
    }
  }

  function mountOrders() {
    const root = el("[data-page='orders']");
    if (!root) return;

    const q = el("#q");
    const status = el("#status");
    const dateFrom = el("#dateFrom");
    const dateTo = el("#dateTo");
    const channel = el("#channel");
    const resetBtn = el("#resetFilters");
    const searchBtn = el("#searchBtn");
    const count = el("#resultCount");
    const tbody = el("#ordersTbody");
    const exportBtn = el("#exportCsv");
    const flowTabs = Array.from(document.querySelectorAll("[data-flow-status]"));
    let flowFilter = "";

    const modalBackdrop = el("#modalBackdrop");
    const modalTitle = el("#modalTitle");
    const modalClose = el("#modalClose");
    const modalKv = el("#modalKv");

    const normalize = (s) => (s || "").trim().toLowerCase();
    const inRange = (d, from, to) => {
      const t = new Date(d).getTime();
      if (from) {
        const f = new Date(from + "T00:00:00").getTime();
        if (t < f) return false;
      }
      if (to) {
        const tt = new Date(to + "T23:59:59").getTime();
        if (t > tt) return false;
      }
      return true;
    };

    const getFilters = () => ({
      q: normalize(q.value),
      status: status.value,
      from: dateFrom.value,
      to: dateTo.value,
      channel: channel.value,
      flowStatus: flowFilter,
    });

    const filterOrders = (orders, f) =>
      orders.filter((o) => {
        if (f.status && o.status !== f.status) return false;
        if (f.channel && o.channel !== f.channel) return false;
        if (f.flowStatus && f.flowStatus !== "all" && o.flowStatus !== f.flowStatus) return false;
        if (!inRange(o.createdAt, f.from, f.to)) return false;
        if (f.q) {
          const hay = normalize([o.id, o.customer, o.game, o.payWay, o.note].join(" "));
          if (!hay.includes(f.q)) return false;
        }
        return true;
      });

    const render = () => {
      const f = getFilters();
      const rows = filterOrders(state.orders, f);
      count.textContent = `${rows.length} 条`;
      tbody.innerHTML = rows
        .map((o) => {
          return `
            <tr>
              <td>
                <div>${o.productTitle}</div>
                <div class="muted mono" style="font-size:12px;">${o.productCode}</div>
              </td>
              <td class="mono">
                <span>${o.id}</span>
                <button class="icon-btn" type="button" data-action="copy-id" data-id="${o.id}" title="复制订单号">
                  <img src="../assets/fuzhi.svg" alt="复制" />
                </button>
              </td>
              <td>${fmtDateTime(o.createdAt)}</td>
              <td>${o.customer}</td>
              <td class="muted">${o.game}</td>
              <td><span class="badge ${statusToBadgeClass(o.status)}">${o.statusName}</span></td>
              <td><span class="badge ${flowStatusToBadgeClass(o.flowStatus)}">${o.flowStatusName}</span></td>
              <td class="mono">${fmtCNY(o.amount)}</td>
              <td class="mono">${o.coins}</td>
              <td>
                <button class="btn" data-action="detail" data-id="${o.id}">详情</button>
              </td>
            </tr>
          `;
        })
        .join("");

      if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10"><div class="empty">没有符合条件的订单</div></td></tr>`;
      }
    };

    const openDetail = (id) => {
      const o = state.orders.find((x) => x.id === id);
      if (!o) return;
      modalTitle.textContent = `订单详情 - ${o.id}`;
      modalKv.innerHTML = `
        <div class="kv">
          <div class="k">状态</div><div class="v"><span class="badge ${statusToBadgeClass(o.status)}">${o.statusName}</span></div>
          <div class="k">创建时间</div><div class="v">${fmtDateTime(o.createdAt)}</div>
          <div class="k">客户</div><div class="v">${o.customer}</div>
          <div class="k">游戏</div><div class="v">${o.game}</div>
          <div class="k">渠道</div><div class="v">${o.channel}</div>
          <div class="k">支付方式</div><div class="v">${o.payWay}</div>
          <div class="k">订单金额</div><div class="v">${fmtCNY(o.amount)}</div>
          <div class="k">游戏币</div><div class="v">${o.coins}</div>
          <div class="k">手续费</div><div class="v">${fmtCNY(o.fee)}</div>
          <div class="k">备注</div><div class="v">${o.note}</div>
        </div>
      `;
      modalBackdrop.classList.add("show");
    };

    const closeDetail = () => modalBackdrop.classList.remove("show");

    const exportCsv = () => {
      const f = getFilters();
      const rows = filterOrders(state.orders, f);
      const header = [
        "商品标题",
        "商品编号",
        "订单号",
        "创建时间",
        "客户",
        "游戏",
        "支付状态",
        "流程状态",
        "金额",
        "游戏币",
        "渠道",
        "支付方式",
        "手续费",
        "备注",
      ];
      const lines = [
        header.join(","),
        ...rows.map((o) =>
          [
            o.productTitle,
            o.productCode,
            o.id,
            fmtDateTime(o.createdAt),
            o.customer,
            o.game,
            o.statusName,
            o.flowStatusName,
            o.amount,
            o.coins,
            o.channel,
            o.payWay,
            o.fee,
            o.note,
          ]
            .map((x) => `"${String(x).replaceAll('"', '""')}"`)
            .join(",")
        ),
      ];
      const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    // init filter options
    const channels = Array.from(new Set(state.orders.map((o) => o.channel))).sort();
    channel.innerHTML = `<option value="">全部</option>` + channels.map((c) => `<option value="${c}">${c}</option>`).join("");

    // listeners
    [q, status, dateFrom, dateTo, channel].forEach((x) => x.addEventListener("input", render));
    [status, channel].forEach((x) => x.addEventListener("change", render));
    resetBtn.addEventListener("click", () => {
      q.value = "";
      status.value = "";
      dateFrom.value = "";
      dateTo.value = "";
      channel.value = "";
      render();
    });
    if (searchBtn) {
      searchBtn.addEventListener("click", render);
    }
    exportBtn.addEventListener("click", exportCsv);

    tbody.addEventListener("click", (e) => {
      const copyBtn = e.target.closest("[data-action='copy-id']");
      if (copyBtn) {
        const val = copyBtn.dataset.id;
        const done = () => showToast("复制成功，订单号已复制到剪贴板");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(done).catch(() => {});
        } else {
          const ta = document.createElement("textarea");
          ta.value = val;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            done();
          } catch {}
          ta.remove();
        }
        return;
      }
      const btn = e.target.closest("[data-action='detail']");
      if (btn) {
        openDetail(btn.dataset.id);
      }
    });

    modalClose.addEventListener("click", closeDetail);
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeDetail();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDetail();
    });

    // flow status tabs
    flowTabs.forEach((btn) =>
      btn.addEventListener("click", () => {
        flowFilter = btn.dataset.flowStatus || "";
        flowTabs.forEach((b) => b.classList.toggle("active", b === btn));
        render();
      })
    );

    window.addEventListener("hashchange", () => {
      mountNavActive();
    });
    render();
  }

  function mountStats() {
    const root = el("[data-page='stats']");
    if (!root) return;

    const kpiTurnover = el("#kpiTurnover");
    const kpiOrders = el("#kpiOrders");
    const kpiPaidRate = el("#kpiPaidRate");
    const kpiAov = el("#kpiAov");
    const tableBody = el("#turnoverTbody");
    const canvas = el("#turnoverChart");
    const rangeSel = el("#range");

    const dayMs = 24 * 60 * 60 * 1000;

    const buildSeries = (days) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const labels = [];
      const values = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * dayMs);
        labels.push(`${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
        // 基于订单数据再加一点波动
        const dayOrders = state.orders.filter((o) => {
          const t = new Date(o.createdAt);
          return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === d.getDate();
        });
        const paidTurnover = sum(dayOrders.filter((o) => o.status === "paid").map((o) => o.amount));
        const noise = (seeded() - 0.5) * 180;
        values.push(Math.max(0, Math.round((paidTurnover + noise) * 100) / 100));
      }
      return { labels, values };
    };

    const drawLine = (labels, values) => {
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, w, h);
      const pad = { l: 44, r: 14, t: 14, b: 30 };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      const maxV = Math.max(...values, 1);
      const minV = Math.min(...values, 0);
      const span = Math.max(1, maxV - minV);

      const xAt = (i) => pad.l + (i / Math.max(1, values.length - 1)) * iw;
      const yAt = (v) => pad.t + (1 - (v - minV) / span) * ih;

      // grid
      ctx.strokeStyle = "rgba(37,99,235,.12)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (i / 4) * ih;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(w - pad.r, y);
        ctx.stroke();
      }

      // axis labels (y)
      ctx.fillStyle = "rgba(100,116,139,.95)";
      ctx.font = "12px ui-sans-serif, system-ui";
      for (let i = 0; i <= 4; i++) {
        const v = minV + (1 - i / 4) * span;
        const y = pad.t + (i / 4) * ih;
        ctx.fillText(String(Math.round(v)), 8, y + 4);
      }

      // line
      const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ih);
      grad.addColorStop(0, "rgba(37,99,235,.26)");
      grad.addColorStop(1, "rgba(37,99,235,0)");

      ctx.beginPath();
      values.forEach((v, i) => {
        const x = xAt(i);
        const y = yAt(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(37,99,235,.95)";
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // area
      ctx.lineTo(xAt(values.length - 1), pad.t + ih);
      ctx.lineTo(xAt(0), pad.t + ih);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // points
      values.forEach((v, i) => {
        const x = xAt(i);
        const y = yAt(v);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "rgba(37,99,235,.95)";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // x labels (sparse)
      const step = values.length <= 7 ? 1 : values.length <= 14 ? 2 : 4;
      ctx.fillStyle = "rgba(100,116,139,.95)";
      for (let i = 0; i < labels.length; i += step) {
        const x = xAt(i);
        ctx.fillText(labels[i], x - 14, h - 10);
      }
    };

    const render = () => {
      const days = Number(rangeSel.value);
      const series = buildSeries(days);

      const paid = state.orders.filter((o) => o.status === "paid");
      const all = state.orders;
      const turnover = sum(paid.map((o) => o.amount));
      const aov = paid.length ? turnover / paid.length : 0;
      const paidRate = all.length ? (paid.length / all.length) * 100 : 0;

      kpiTurnover.textContent = fmtCNY(turnover);
      kpiOrders.textContent = `${all.length}`;
      kpiPaidRate.textContent = `${paidRate.toFixed(1)}%`;
      kpiAov.textContent = fmtCNY(aov);

      tableBody.innerHTML = series.labels
        .map((lab, i) => {
          const v = series.values[i];
          return `
            <tr>
              <td class="mono">${lab}</td>
              <td class="mono">${fmtCNY(v)}</td>
              <td class="muted">${v >= (series.values[i - 1] ?? v) ? "↗" : "↘"} </td>
            </tr>
          `;
        })
        .join("");

      drawLine(series.labels, series.values);
    };

    rangeSel.addEventListener("change", render);
    window.addEventListener("resize", render);
    render();
  }

  function mountHome() {
    const root = el("[data-page='home']");
    if (!root) return;
    const total = el("#homeTotal");
    const paid = state.orders.filter((o) => o.status === "paid");
    total.textContent = fmtCNY(sum(paid.map((o) => o.amount)));
  }

  function mountShop() {
    const root = el("[data-page='shop']");
    if (!root) return;

    const openBtn = el("#openShopModal");
    const backdrop = el("#shopModalBackdrop");
    const closeBtn = el("#shopModalClose");
    const cancelBtn = el("#shopModalCancel");
    const typeSelect = el("#shopTypeSelect");
    const connectSelect = el("#connectTypeSelect");
    const nameInput = el("#shopNameInput");
    const douyinExtra = el("#douyinExtraFields");
    const douyinMsg = el("#douyinMsgFields");
    const deleteBackdrop = el("#shopDeleteBackdrop");
    const deleteNameEl = el("#shopDeleteName");
    const deleteConfirmBtn = el("#shopDeleteConfirm");
    const deleteCancelBtn = el("#shopDeleteCancel");
    const productsBackdrop = el("#shopProductsBackdrop");
    const productsCloseBtn = el("#shopProductsClose");

    const fillConnectOptions = () => {
      const type = typeSelect.value;
      let options = [];
      if (type === "淘宝") {
        options = ["91自有货源", "91标准货源"];
      } else if (type === "抖音") {
        options = ["91自有货源", "抖音官方"];
      } else if (type) {
        options = ["91自有货源"];
      } else {
        options = [];
      }
      const current = connectSelect.value;
      connectSelect.innerHTML =
        `<option value="">请选择对接方式</option>` +
        options.map((t) => `<option value="${t}">${t}</option>`).join("");
      if (!options.includes(current)) {
        connectSelect.value = "";
      } else {
        connectSelect.value = current;
      }
      toggleDouyinExtra();
    };

    const toggleDouyinExtra = () => {
      if (!douyinExtra) return;
      const isDyOfficial = connectSelect.value === "抖音官方";
      douyinExtra.style.display = isDyOfficial ? "block" : "none";
      if (douyinMsg) {
        const auto = (root.querySelector("input[name='autoRefund']:checked") || {}).value;
        const showMsg = isDyOfficial && auto !== "off";
        douyinMsg.style.display = showMsg ? "block" : "none";
      }
    };

    const open = () => {
      backdrop.classList.add("show");
      nameInput && nameInput.focus();
    };
    const close = () => backdrop.classList.remove("show");

    const openDelete = (shopName) => {
      if (!deleteBackdrop || !deleteNameEl) return;
      deleteNameEl.textContent = shopName || "";
      deleteBackdrop.classList.add("show");
    };
    const closeDelete = () => {
      deleteBackdrop && deleteBackdrop.classList.remove("show");
    };

    const openProducts = () => {
      productsBackdrop && productsBackdrop.classList.add("show");
    };
    const closeProducts = () => {
      productsBackdrop && productsBackdrop.classList.remove("show");
    };

    openBtn && openBtn.addEventListener("click", open);
    closeBtn && closeBtn.addEventListener("click", close);
    cancelBtn && cancelBtn.addEventListener("click", close);
    backdrop &&
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) close();
      });
    typeSelect && typeSelect.addEventListener("change", fillConnectOptions);
    connectSelect && connectSelect.addEventListener("change", toggleDouyinExtra);
    root.querySelectorAll("input[name='autoRefund']").forEach((r) =>
      r.addEventListener("change", toggleDouyinExtra)
    );

    root.querySelectorAll("[data-action='delete-shop']").forEach((btn) => {
      btn.addEventListener("click", () => {
        openDelete(btn.dataset.shop || "");
      });
    });
    deleteCancelBtn && deleteCancelBtn.addEventListener("click", closeDelete);
    deleteConfirmBtn &&
      deleteConfirmBtn.addEventListener("click", () => {
        closeDelete();
        showToast("已确认删除（仅原型，无实际操作）");
      });
    deleteBackdrop &&
      deleteBackdrop.addEventListener("click", (e) => {
        if (e.target === deleteBackdrop) closeDelete();
      });

    root.querySelectorAll(".shop-footer .btn").forEach((btn) => {
      if (btn.textContent.includes("配置商品")) {
        btn.addEventListener("click", openProducts);
      }
    });
    productsCloseBtn && productsCloseBtn.addEventListener("click", closeProducts);
    productsBackdrop &&
      productsBackdrop.addEventListener("click", (e) => {
        if (e.target === productsBackdrop) closeProducts();
      });

    fillConnectOptions();
  }

  function mountProductList() {
    const root = el("[data-page='product_list']");
    if (!root) return;

    const GROUPS = {
      honor: "王者荣耀",
      genshin: "原神",
      pubg: "和平精英",
      dnf: "DNF",
      hsr: "崩坏：星穹铁道",
      coin: "综合游戏币",
    };

    const params = new URLSearchParams(location.search);
    const key = params.get("group") || "honor";
    const groupName = GROUPS[key] || GROUPS.honor;

    const titleEl = el("#productListTitle");
    const labelEl = el("#productGroupLabel");
    const tbody = el("#productListTbody");
    const backBtn = el("#btnBackGrid");

    if (titleEl) titleEl.textContent = `商品 · ${groupName} · 商品列表`;
    if (labelEl) labelEl.textContent = `${groupName}（${key}）`;

    const rows = [];
    for (let i = 1; i <= 8; i++) {
      const code = `SP-${key.toUpperCase()}-${String(1000 + i).slice(-4)}`;
      const price = (12 + ((i * 7) % 50) + 0.5).toFixed(2);
      const stock = 20 + (i * 13) % 200;
      const on = i % 5 !== 0;
      rows.push(`
        <tr>
          <td class="mono">${code}</td>
          <td>${groupName} · 游戏币套餐 ${i}</td>
          <td class="muted">${(i % 3) + 1} 万币</td>
          <td class="mono">¥${price}</td>
          <td class="mono">${stock}</td>
          <td><span class="badge ${on ? "paid" : "cancelled"}">${on ? "已上架" : "已下架"}</span></td>
          <td><button class="btn ghost" type="button">编辑</button></td>
        </tr>
      `);
    }
    if (tbody) tbody.innerHTML = rows.join("");

    backBtn &&
      backBtn.addEventListener("click", () => {
        location.href = "./products.html";
      });
  }

  function init() {
    mountNavActive();
    mountHome();
    mountStats();
    mountOrders();
    mountShop();
    mountProductList();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => App.init());

