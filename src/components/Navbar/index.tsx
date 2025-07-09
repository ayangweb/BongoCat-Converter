import {
  Button,
  Navbar as HeroNavBar,
  Image,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Github } from "lucide-react";
import { APP_GITHUB_URL, APP_NAME } from "@/constants";
import Theme from "./Theme";

const Navbar = () => {
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
          <Theme />
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
