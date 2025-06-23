import { Alert, Card, Tab, Tabs } from "@heroui/react";
import { supported } from "browser-fs-access";
import Conversion from "./components/Conversion";
import Synthesis from "./components/Synthesis";

const App = () => {
  //   const readConfig = async (handles: Handles) => {
  //     const handle = handles.find((item) => item.name === "config.json");

  //     if (!handle) {
  //       return addToast({
  //         color: "danger",
  //         title: "未找到 config.json 文件夹",
  //       });
  //     }

  //     if (handle instanceof File) {
  //       if (handle.directoryHandle) {
  //         createFile(handle.directoryHandle, "aaa/bbb/ccc/1.txt", "123123");
  //       }

  //       const text = await handle.text();

  //       const json = JSON.parse(text);

  //       abc(handles, json);
  //     }
  //   };

  //   const abc = (handles: Handles, configJSON: Config) => {};

  return supported ? (
    <div className="flex h-screen flex-col items-center justify-center">
      <Tabs>
        <Tab title="模型转换">
          <Conversion />
        </Tab>

        <Tab title="图片合成">
          <Card>
            <Synthesis />
          </Card>
        </Tab>
      </Tabs>
    </div>
  ) : (
    <Alert color="danger" variant="faded">
      当前浏览器不支持文件系统访问功能，请使用最新版的 Google Chrome 或
      Microsoft Edge 浏览器。
    </Alert>
  );
};

export default App;
