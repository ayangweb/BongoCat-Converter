import {
  Button,
  Navbar as HeroNavBar,
  Image,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { ThemeProps, useTheme } from "@heroui/use-theme";
import { Github, Moon, Sun } from "lucide-react";
import { APP_GITHUB_URL, APP_NAME } from "@/constants";

const Navbar = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === ThemeProps.LIGHT) {
      return setTheme(ThemeProps.DARK);
    }

    setTheme(ThemeProps.LIGHT);
  };

  const openGithub = () => {
    window.open(APP_GITHUB_URL);
  };

  return (
    <HeroNavBar isBordered maxWidth="xl">
      <NavbarBrand className="gap-2">
        <Image src="/logo.png" width={48} />

        <h3 className="font-bold text-xl">{APP_NAME} 模型转换工具</h3>
      </NavbarBrand>

      <NavbarContent className="text-foreground-600" justify="end">
        <NavbarItem>
          <Button
            className="text-foreground-600"
            isIconOnly
            onPress={toggleTheme}
            variant="bordered"
          >
            {theme === ThemeProps.LIGHT ? <Sun /> : <Moon />}
          </Button>
        </NavbarItem>

        <NavbarItem>
          <Button
            className="text-foreground-600"
            isIconOnly
            onPress={openGithub}
            variant="bordered"
          >
            <Github />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroNavBar>
  );
};

export default Navbar;
