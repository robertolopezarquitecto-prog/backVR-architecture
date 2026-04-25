import { render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("@/components/VRViewer", () => ({
  __esModule: true,
  default: () => <div data-testid="vr-viewer-mock" />,
}));

describe("Home page", () => {
  it("renders the VR viewer region", () => {
    render(<Home />);
    expect(screen.getByTestId("vr-viewer-mock")).toBeInTheDocument();
  });
});
