import { expect, test } from "@playwright/test";

test("start quiz → answer → feedback → next → history persists", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.getByTestId("start-quiz")).toBeEnabled();
  await page.getByRole("button", { name: "1問" }).click();
  await page.getByTestId("start-quiz").click();
  await page.getByTestId("choice-0").click();
  await page.getByTestId("submit-answer").click();
  await expect(page.getByTestId("feedback")).toBeVisible();
  await page.getByTestId("next-question").click();
  await expect(page.getByText("セッション完了")).toBeVisible();

  await page.reload();
  await page.goto("/");
  await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("この端末")).toBeVisible();
});
