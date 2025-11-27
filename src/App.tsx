import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tab,
  Tabs,
} from "@heroui/react";
import { supported } from "browser-fs-access";
import { FileText, Image } from "lucide-react";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import Converter from "./components/Converter";
import Navbar from "./components/Navbar";
import Synthesis from "./components/Synthesis";
import { APP_NAME, LEGACY_APP_NAME } from "./constants";

const App = () => {
  const tabs = [
    {
      children: <Converter />,
      description: `将 ${LEGACY_APP_NAME} 应用中的模型转换为兼容 ${APP_NAME} 的格式。`,
      icon: <FileText />,
      iconClass: "text-primary",
      title: "模型转换",
    },
    {
      children: <Synthesis />,
      description: "对转换异常的键位图片进行手动合成处理。",
      icon: <Image />,
      iconClass: "text-success",
      title: "图片合成",
    },
  ];

  return supported ? (
    <>
      <Navbar />

      <div className="m-auto max-w-7xl px-6 py-8 text-center">
        <h1 className="mb-4 font-bold text-3xl">
          欢迎使用 {APP_NAME} 模型转换工具
        </h1>

        <p className="mx-auto max-w-2xl text-foreground-500 text-lg">
          {`这个工具可以帮助你将 ${LEGACY_APP_NAME} 应用中的模型转换为兼容 ${APP_NAME} 的格式，并提供强大的图片合成功能。`}
        </p>

        <div className="my-8 flex gap-6">
          {tabs.map((item) => {
            const { title, description, icon, iconClass } = item;

            return (
              <Card className="flex-1" key={title} shadow="sm">
                <CardBody className="items-center gap-4 py-8">
                  {cloneElement(icon, {
                    className: twMerge("size-10", iconClass),
                  })}

                  <span className="font-semibold text-lg">{title}</span>

                  <p className="text-foreground-500">{description}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Tabs destroyInactiveTabPanel={false} fullWidth size="lg">
          {tabs.map((item) => {
            const { title, icon, iconClass, children } = item;

            return (
              <Tab
                key={title}
                title={
                  <div className="flex items-center gap-2">
                    {cloneElement(icon, {
                      className: "size-5",
                    })}

                    <span>{title}</span>
                  </div>
                }
              >
                <Card>
                  <CardHeader className="gap-2">
                    {cloneElement(icon, {
                      className: twMerge("size-5", iconClass),
                    })}

                    <span>{title}</span>
                  </CardHeader>

                  <Divider />

                  <CardBody className="overflow-hidden">{children}</CardBody>
                </Card>
              </Tab>
            );
          })}
        </Tabs>
      </div>
    </>
  ) : (
    <Alert color="danger" variant="faded">
      当前浏览器不支持文件系统访问功能，请使用最新版的 Google Chrome 或
      Microsoft Edge 浏览器。
    </Alert>
  );
};

export default App;
