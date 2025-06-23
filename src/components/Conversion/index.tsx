import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Divider,
} from "@heroui/react";
import { useReactive } from "ahooks";
import {
  directoryOpen,
  type FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { find } from "es-toolkit/compat";
import { useState } from "react";
import type { Config } from "@/types";

interface State {
  handles: FileWithDirectoryAndFileHandle[];
  configJSON?: Config;
  loading?: boolean;
}

const Conversion = () => {
  const [modes, setModes] = useState(["standard"]);
  const state = useReactive<State>({
    handles: [],
  });

  const selectModel = async () => {
    state.handles = await directoryOpen({
      recursive: true,
    });

    renderConfig();
  };

  const renderConfig = async () => {
    const handle = find(state.handles, { name: "config.json" });

    if (!handle) {
      return addToast({
        color: "danger",
        title: "未找到 config.json 文件，请选择正确的模型文件夹。",
      });
    }

    const text = await handle.text();

    state.configJSON = JSON.parse(text);
  };

  // const handleOk = () => {
  //   for (const mode of modes) {
  //   }
  // };

  return (
    <Card>
      <CardHeader>
        快速将旧版 BongoCatMver 的模型转换为适配新版 BongoCat 的模型。
      </CardHeader>

      <Divider />

      <CardBody className="flex flex-col gap-4">
        <Button color="primary" onPress={selectModel} variant="bordered">
          选择模型
        </Button>

        <CheckboxGroup
          errorMessage="请选择至少一种模式。"
          isInvalid={modes.length === 0}
          isRequired
          label="选择模式"
          name="modes"
          onChange={setModes}
          orientation="horizontal"
          value={modes}
        >
          <Checkbox value="standard">标准模式</Checkbox>
          <Checkbox value="keyboard">键盘模式</Checkbox>
          <Checkbox isDisabled value="gamepad">
            手柄模式（敬请期待）
          </Checkbox>
        </CheckboxGroup>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-end">
        <Button
          color="primary"
          isDisabled={!state.handles.length || !modes.length}
          isLoading={state.loading}
        >
          转换
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Conversion;
