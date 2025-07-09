import { Button } from "@heroui/react";
import { ThemeProps, useTheme } from "@heroui/use-theme";
import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

const Theme = () => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === ThemeProps.DARK;

  const toggleTheme = () => {
    if (isDark) {
      return setTheme(ThemeProps.LIGHT);
    }

    setTheme(ThemeProps.DARK);
  };

  const handleClick = async (event: MouseEvent) => {
    await document.startViewTransition(toggleTheme).ready;

    const { clientX: x, clientY: y } = event;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );

    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];

    document.documentElement.animate(
      {
        clipPath: isDark ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 400,
        easing: "ease-in",
        pseudoElement: isDark
          ? "::view-transition-new(root)"
          : "::view-transition-old(root)",
      },
    );
  };

  return (
    <Button
      className="text-foreground-600"
      isIconOnly
      onClick={handleClick}
      variant="bordered"
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
};

export default Theme;
