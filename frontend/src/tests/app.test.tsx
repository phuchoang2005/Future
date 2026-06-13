import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";
import { store } from "../store/store";

describe("App", () => {
  it("renders the development login route", () => {
    window.history.pushState({}, "", "/login");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});
