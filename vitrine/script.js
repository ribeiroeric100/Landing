(() => {
    const tabRegister = document.getElementById("tab-register");
    const tabLogin = document.getElementById("tab-login");
    const sectionRegister = document.getElementById("auth-register");
    const sectionLogin = document.getElementById("auth-login");

    if (!tabRegister || !tabLogin || !sectionRegister || !sectionLogin) {
        return;
    }

    const setTabState = (tab, isActive) => {
        tab.classList.toggle("border-b-primary", isActive);
        tab.classList.toggle("border-b-transparent", !isActive);
        tab.classList.toggle("text-[#1e293b]", isActive);
        tab.classList.toggle("text-gray-500", !isActive);
        tab.classList.toggle("dark:text-white", isActive);
        tab.classList.toggle("dark:text-gray-400", !isActive);
    };

    const activate = (target) => {
        const isRegister = target === "register";
        sectionRegister.classList.toggle("hidden", !isRegister);
        sectionLogin.classList.toggle("hidden", isRegister);
        setTabState(tabRegister, isRegister);
        setTabState(tabLogin, !isRegister);
    };

    tabRegister.addEventListener("click", () => activate("register"));
    tabLogin.addEventListener("click", () => activate("login"));

    const openLoginButtons = [
        document.getElementById("open-login-modal"),
        document.getElementById("open-login-modal-mobile")
    ].filter(Boolean);

    openLoginButtons.forEach((button) => {
        button.addEventListener("click", () => activate("login"));
    });

    activate("register");
})();

(() => {
    const coursesGrid = document.getElementById("courses-grid");
    const pagination = document.getElementById("courses-pagination");
    const coursesCount = document.getElementById("courses-count");
    const areaInputs = Array.from(document.querySelectorAll("[data-area-filter]"));
    const searchInput = document.getElementById("course-search");

    if (!coursesGrid || !pagination || !coursesCount) {
        return;
    }

    const imageByArea = {
        AGRICULTURA: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60",
        AGROINDUSTRIA: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60",
        AQUICULTURA: "https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?auto=format&fit=crop&w=800&q=60",
        "ATIVIDADES DE APOIO AGROSSILVIPASTORIL": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=60",
        "ATIVIDADES RELATIVAS A PRESTACAO DE SERVICOS": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60",
        PECUARIA: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60",
        SILVICULTURA: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=60",
        DEFAULT: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60"
    };

    const normalizeText = (value) =>
        (value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase();

    const ensureCardImages = () => {
        const cards = Array.from(coursesGrid.querySelectorAll("article"));
        cards.forEach((card) => {
            card.classList.add("course-card");

            const areaLabel = card.querySelector("span");
            const normalizedArea = areaLabel ? normalizeText(areaLabel.textContent) : "DEFAULT";
            card.dataset.area = normalizedArea;
            if (areaLabel) {
                areaLabel.classList.add("course-tag");
            }

            if (card.querySelector("img")) {
                return;
            }

            const imageUrl = imageByArea[normalizedArea] || imageByArea.DEFAULT;

            const imageWrap = document.createElement("div");
            imageWrap.className = "h-32 mb-4 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700";

            const image = document.createElement("img");
            image.alt = "Imagem do curso";
            image.loading = "lazy";
            image.className = "w-full h-full object-cover";
            image.src = imageUrl;

            imageWrap.appendChild(image);
            card.insertBefore(imageWrap, card.firstChild);
        });
        return cards;
    };

    const allCards = ensureCardImages();
    let filteredCards = allCards.slice();
    const perPage = 9;

    const updateCount = (visibleStart, visibleEnd, total) => {
        if (total === 0) {
            coursesCount.textContent = "Mostrando 0 de 0 cursos";
            return;
        }
        coursesCount.textContent = `Mostrando ${visibleStart} a ${visibleEnd} de ${total} cursos`;
    };

    const renderPage = (page) => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pageCards = filteredCards.slice(startIndex, endIndex);

        allCards.forEach((card) => {
            card.style.display = "none";
        });

        pageCards.forEach((card) => {
            card.style.display = "";
        });

        const visibleStart = Math.min(startIndex + 1, filteredCards.length);
        const visibleEnd = Math.min(endIndex, filteredCards.length);
        updateCount(visibleStart, visibleEnd, filteredCards.length);

        Array.from(pagination.children).forEach((btn) => {
            const btnPage = Number(btn.dataset.page);
            btn.className = btnPage === page
                ? "size-10 flex items-center justify-center rounded-lg bg-secondary text-white font-bold"
                : "size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-secondary hover:text-secondary transition-all";
        });
    };

    const buildPagination = () => {
        pagination.innerHTML = "";

        if (filteredCards.length === 0) {
            allCards.forEach((card) => {
                card.style.display = "none";
            });
            updateCount(0, 0, 0);
            return;
        }

        const totalPages = Math.ceil(filteredCards.length / perPage);
        for (let page = 1; page <= totalPages; page += 1) {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.page = String(page);
            button.textContent = String(page);
            button.className = "size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:border-secondary hover:text-secondary transition-all";
            button.addEventListener("click", () => renderPage(page));
            pagination.appendChild(button);
        }

        renderPage(1);
    };

    const syncSelection = (changedInput) => {
        if (!changedInput || !changedInput.checked) {
            const anyChecked = areaInputs.some((input) => input.checked);
            const allInput = areaInputs.find((input) => input.dataset.area === "ALL");
            if (!anyChecked && allInput) {
                allInput.checked = true;
            }
            return;
        }

        areaInputs.forEach((input) => {
            if (input !== changedInput) {
                input.checked = false;
            }
        });
    };

    const applyFilters = () => {
        const selected = areaInputs.find((input) => input.checked);
        const selectedArea = selected ? selected.dataset.area : "ALL";
        const searchTerm = normalizeText(searchInput ? searchInput.value : "").trim();

        filteredCards = allCards.filter((card) => {
            const matchesArea = !selectedArea || selectedArea === "ALL"
                ? true
                : card.dataset.area === selectedArea;
            if (!matchesArea) return false;

            if (!searchTerm) return true;
            const title = normalizeText(card.querySelector("h3")?.textContent);
            return title.includes(searchTerm);
        });

        buildPagination();
    };

    areaInputs.forEach((input) => {
        input.addEventListener("change", () => {
            syncSelection(input);
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            applyFilters();
        });
    }

    syncSelection(areaInputs.find((input) => input.dataset.area === "ALL"));
    applyFilters();
})();
