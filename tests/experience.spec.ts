import { expect, test } from "@playwright/test";

test("the hero sells the membrane and the quote is written from the press selection", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Membranas hechas para aguantar." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Pausar animaciones", exact: true })
    .click();
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-paused",
    "true",
  );
  await page.screenshot({
    path: `docs/reference/membrana/hero-${testInfo.project.name}.png`,
  });
  await page.getByRole("button", { name: "Diemme", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Prensa Diemme Velvet T26" }),
  ).toBeVisible();
  await page.getByLabel("Modelo de la prensa").fill("Velvet T26");
  await page.getByRole("button", { name: "Gran Mendoza", exact: true }).click();
  await expect(page.locator("#contact-message")).toHaveValue(
    "Quisiera cotizar una membrana para una prensa Diemme, modelo Velvet T26. Mi planta está en el Gran Mendoza.",
  );
  await expect(
    page.getByText("Toma de medidas y despacho sin cargo."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Enviar por correo" }),
  ).toHaveAttribute("href", /^mailto:fateplas@yahoo\.com\.ar\?.*Diemme/);
  await page.getByRole("link", { name: "Consultar por un kit" }).click();
  await expect(page.locator("#contact-message")).toHaveValue(
    /^Quisiera consultar por un kit de reparación/,
  );
  await page.locator("#contact-name").fill("Mi nombre");
  await page.locator("#contact-message").fill("Mi consulta escrita a mano.");
  await page.getByRole("button", { name: "Willmes", exact: true }).click();
  await expect(page.locator("#contact-message")).toHaveValue(
    "Mi consulta escrita a mano.",
  );
  await expect(page.locator("#contact-name")).toHaveValue("Mi nombre");
  await page
    .getByRole("button", { name: "Pedir cotización", exact: true })
    .click();
  await expect(page.locator(".contact-form").getByRole("status")).toContainText(
    "Vista previa",
  );
  await page.getByText("¿Qué incluye el servicio?").click();
  await expect(
    page.getByText("Toma de medidas y despacho gratis en el Gran Mendoza."),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("the three bench tests can be passed and lead to the quote", async ({
  page,
}) => {
  await page.goto("/");
  const bench = page.locator("#pruebas");
  const result = bench.getByRole("status");
  await expect(result).toContainText("0/3");
  const hold = bench.getByRole("button", { name: "Mantenga presionado" });
  await hold.scrollIntoViewIfNeeded();
  await hold.dispatchEvent("pointerdown");
  await expect(
    bench.getByRole("button", { name: "Equivale a 78 bar" }),
  ).toBeDisabled({ timeout: 6000 });
  await expect(bench.getByText("7,8MPa")).toBeVisible();
  await expect(result).toContainText("1/3");
  await bench.getByRole("button", { name: "Tire de la tela" }).click();
  await expect(result).toContainText("2/3");
  await bench.getByRole("slider").fill("60");
  await expect(result).toContainText("3/3");
  await expect(result).toContainText("Tres de tres");
  await expect(bench.locator("li[data-done=true]")).toHaveCount(3);
  await bench.getByRole("link", { name: "Cotizar mi membrana" }).click();
  await expect(page.locator("#cotizar")).toBeInViewport();
});

test("the cut is inspected from the drawing, the tags and the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const cut = page.locator("#materiales");
  const data = cut.locator(".inspector-data");
  await expect(data).toContainText("60 °C");
  expect(
    await cut.locator("image").evaluate((image) => image.getAttribute("href")),
  ).toContain("membrane-layers.png");
  await cut.getByRole("button", { name: "Ver matriz" }).click();
  await expect(data).toContainText("7,8 MPa");
  await expect(data).toContainText("Resistencia hidrostática mínima");
  const tabs = cut.getByRole("group", { name: "Capas de la tela" });
  await expect(tabs.getByRole("button", { name: "Matriz" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await tabs.getByRole("button", { name: "Matriz" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(data).toContainText("1100 dTex");
  await expect(tabs.getByRole("button", { name: "Soporte" })).toBeFocused();
  await cut.locator(".inspector-hit").first().click({ force: true });
  await expect(data).toContainText("Cubierta de poliéster");
  await expect(cut.locator(".inspector-outline")).toHaveCount(1);
});

test("clients can be browsed by region and searched", async ({ page }) => {
  await page.goto("/");
  const clients = page.locator("#clientes");
  await clients.getByRole("button", { name: /San Juan/ }).click();
  await expect(clients.locator(".client-names li")).toHaveCount(12);
  await clients
    .getByRole("button", { name: "Ver los 25 clientes de San Juan" })
    .click();
  await expect(clients.locator(".client-names li")).toHaveCount(25);
  await expect(clients.getByText("Bodegas Callia S.A.")).toBeVisible();
  await clients.getByRole("searchbox").fill("penaflor");
  await expect(clients.locator(".client-names li")).toHaveCount(2);
  await expect(clients.getByRole("status")).toContainText("2 resultados");
});

test("reduced motion keeps the bench usable without holding or animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect
    .poll(() => page.locator(".experience").getAttribute("data-paused"))
    .toBe("true");
  const bench = page.locator("#pruebas");
  const hold = bench.getByRole("button", { name: "Mantenga presionado" });
  await hold.focus();
  await page.keyboard.press("Enter");
  await expect(bench.getByRole("status")).toContainText("1/3");
  expect(
    await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(".hero *, .trust-names > div"),
      ).every((element) => getComputedStyle(element).animationName === "none"),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
