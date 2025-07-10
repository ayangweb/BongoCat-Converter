import { addToast, Button, Checkbox, CheckboxGroup } from "@heroui/react";
import {
  directoryOpen,
  type FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import { last, noop, sum } from "es-toolkit";
import { find, map } from "es-toolkit/compat";
import { Folder, FolderOpen, Gamepad2, Keyboard, Mouse } from "lucide-react";
import mergeImages from "merge-images";
import { cloneElement, useState } from "react";
import {
  APP_NAME,
  LEGACY_APP_NAME,
  MODE,
  MODE_CN,
  OUTPUT_DIR,
  OUTPUT_FILE,
  SOURCE_BG_FILE,
  SOURCE_DIR,
  SOURCE_FILE,
} from "@/constants";
import type { ConfigSchema } from "@/types";
import { base64ToBlob } from "@/utils/binary";
import { join, writeFile } from "@/utils/fsExtra";
import { keyMap } from "@/utils/keyMap";
import Upload from "../Upload";

interface RootDir {
  name: string;
  size: number;
  handle: FileSystemDirectoryHandle;
}

const Converter = () => {
  const [modes, setModes] = useState([MODE.STANDARD]);
  const [rootDir, setRootDir] = useState<RootDir>();
  const [handles, setHandles] = useState<FileWithDirectoryAndFileHandle[]>([]);
  const [configSchema, setConfigSchema] = useState<ConfigSchema>();
  const [loading, setLoading] = useState(false);

  const modeOptions = [
    {
      icon: <Mouse />,
      title: MODE_CN[MODE.STANDARD],
      value: MODE.STANDARD,
    },
    {
      icon: <Keyboard />,
      title: MODE_CN[MODE.KEYBOARD],
      value: MODE.KEYBOARD,
    },
    {
      icon: <Gamepad2 />,
      isDisabled: true,
      title: MODE_CN[MODE.GAMEPAD],
      value: MODE.GAMEPAD,
    },
  ];

  const handleSelect = async () => {
    try {
      const handles: FileWithDirectoryAndFileHandle[] = await directoryOpen({
        recursive: true,
      });

      const configHandle = find(handles, { name: SOURCE_FILE.CONFIG });

      if (!configHandle) {
        return addToast({
          color: "danger",
          title: `未找到 ${SOURCE_FILE.CONFIG} 文件，请选择正确的应用文件夹。`,
        });
      }

      const configText = await configHandle.text();
      setConfigSchema(JSON.parse(configText));

      const rootHandle = configHandle.directoryHandle!;
      setRootDir({
        handle: rootHandle,
        name: rootHandle.name,
        size: sum(map(handles, "size")),
      });

      setHandles(handles);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      addToast({
        color: "danger",
        title: String(error),
      });
    }
  };

  const handleDeselect = () => {
    setRootDir(void 0);
    setHandles([]);
    setConfigSchema(void 0);
    setLoading(false);
  };

  const handleConvert = async () => {
    try {
      if (!rootDir || !configSchema) return;

      setLoading(true);

      for await (const mode of modes) {
        const outputDir = `${APP_NAME} - ${MODE_CN[mode]}`;

        await removeOutputDir(outputDir);

        await Promise.all([
          copyModelFiles(mode, outputDir),
          copyBgImage(mode, outputDir),
          copyCoverImage(mode, outputDir),
        ]);

        const keyboardHandles = handles.filter((handle) => {
          return handle.webkitRelativePath.includes(
            `${mode}/${SOURCE_DIR.KEYBOARD}`,
          );
        });

        if (mode === MODE.STANDARD) {
          const handHandles = handles.filter((handle) => {
            return handle.webkitRelativePath.includes(
              `${mode}/${SOURCE_DIR.HAND}`,
            );
          });

          for (const item of configSchema.standard.hand.entries()) {
            const [index, [key]] = item;

            const keyboardHandle = find(keyboardHandles, {
              name: `${index}.png`,
            });
            const handHandle = find(handHandles, {
              name: `${index}.png`,
            });

            if (keyboardHandle && handHandle) {
              const path = join(
                outputDir,
                join(
                  OUTPUT_DIR.RESOURCES,
                  OUTPUT_DIR.LEFT_KEYS,
                  `${keyMap[key]}.png`,
                ),
              );
              const data = await convertImages(keyboardHandle, handHandle);

              await writeFile(rootDir.handle, path, data);
            }
          }
        }

        if (mode === MODE.KEYBOARD) {
          const { lefthand, righthand } = configSchema.keyboard;

          const leftHandHandles = handles.filter((handle) => {
            return handle.webkitRelativePath.includes(
              `${mode}/${SOURCE_DIR.LEFT_HAND}`,
            );
          });

          const rightHandHandles = handles.filter((handle) => {
            return handle.webkitRelativePath.includes(
              `${mode}/${SOURCE_DIR.RIGHT_HAND}`,
            );
          });

          for (const item of lefthand.entries()) {
            const [index, [key]] = item;

            const keyboardHandle = find(keyboardHandles, {
              name: `${index}.png`,
            });
            const handHandle = find(leftHandHandles, {
              name: `${index}.png`,
            });

            if (keyboardHandle && handHandle) {
              const path = join(
                outputDir,
                join(
                  OUTPUT_DIR.RESOURCES,
                  OUTPUT_DIR.LEFT_KEYS,
                  `${keyMap[key]}.png`,
                ),
              );
              const data = await convertImages(keyboardHandle, handHandle);

              await writeFile(rootDir.handle, path, data);
            }
          }

          for (const item of righthand.entries()) {
            const [index, [key]] = item;

            const keyboardHandle = find(keyboardHandles, {
              name: `${lefthand.length + index}.png`,
            });
            const handHandle = find(rightHandHandles, {
              name: `${index}.png`,
            });

            if (keyboardHandle && handHandle) {
              const path = join(
                outputDir,
                join(
                  OUTPUT_DIR.RESOURCES,
                  OUTPUT_DIR.RIGHT_KEYS,
                  `${keyMap[key]}.png`,
                ),
              );
              const data = await convertImages(keyboardHandle, handHandle);

              await writeFile(rootDir.handle, path, data);
            }
          }
        }
      }

      addToast({
        color: "success",
        title: "转换成功，前往应用文件夹查看。",
      });
    } catch (error) {
      addToast({
        color: "danger",
        title: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除输出目录
  const removeOutputDir = async (name: string) => {
    await rootDir?.handle.removeEntry(name, { recursive: true }).catch(noop);
  };

  // 复制模型相关文件
  const copyModelFiles = async (mode: string, outputDir: string) => {
    if (!rootDir) return;

    const filterHandles = handles.filter((handle) => {
      return handle.webkitRelativePath.includes(join(mode, SOURCE_DIR.MODEL));
    });

    for await (const handle of filterHandles) {
      const originalPath = last(
        handle.webkitRelativePath.split(SOURCE_DIR.MODEL),
      )!;
      const path = join(outputDir, originalPath);
      const data = await handle.arrayBuffer();

      await writeFile(rootDir.handle, path, data);
    }
  };

  // 复制背景图片
  const copyBgImage = async (mode: string, outputDir: string) => {
    if (!rootDir) return;

    const handle = handles.find((item) => {
      return item.webkitRelativePath.includes(join(mode, SOURCE_BG_FILE[mode]));
    });

    if (!handle) return;

    const path = join(outputDir, OUTPUT_DIR.RESOURCES, OUTPUT_FILE.BG);
    const data = await handle.arrayBuffer();

    return writeFile(rootDir.handle, path, data);
  };

  // 复制封面图片
  const copyCoverImage = async (mode: string, outputDir: string) => {
    if (!rootDir) return;

    const handle = handles.find((item) => {
      return item.webkitRelativePath.includes(join(mode, SOURCE_FILE.COVER));
    });

    if (!handle) return;

    const path = join(outputDir, OUTPUT_DIR.RESOURCES, OUTPUT_FILE.COVER);
    const data = await handle.arrayBuffer();

    return writeFile(rootDir.handle, path, data);
  };

  // 转换键盘和手部图片
  const convertImages = async (
    keyboardHandle: FileWithDirectoryAndFileHandle,
    handHandle: FileWithDirectoryAndFileHandle,
  ) => {
    const keyboardBuffer = await keyboardHandle.arrayBuffer();
    const handBuffer = await handHandle.arrayBuffer();

    const blobs = [keyboardBuffer, handBuffer].map((buffer) => {
      return new Blob([buffer], { type: "image/png" });
    });

    const urls = blobs.map(URL.createObjectURL);

    const base64 = await mergeImages(urls);

    return base64ToBlob(base64);
  };

  return (
    <>
      <Upload
        classNames={{ root: "border-2" }}
        description={`请选择完整的 ${LEGACY_APP_NAME} 应用文件夹，其子目录中应包含 ${SOURCE_FILE.CONFIG} 文件。`}
        draggable={false}
        icon={FolderOpen}
        onDeselect={handleDeselect}
        onPress={handleSelect}
        selectedIcon={Folder}
        selectedItem={rootDir}
        title="选择应用文件夹"
      />

      <CheckboxGroup
        className="my-6"
        errorMessage="请选择至少一种模式。"
        isDisabled={loading}
        isInvalid={modes.length === 0}
        isRequired
        label="选择模式"
        name="modes"
        onChange={setModes}
        orientation="horizontal"
        value={modes}
      >
        {modeOptions.map((item) => {
          const { title, value, icon, isDisabled } = item;

          return (
            <Checkbox
              className="m-0 max-w-[unset] flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg border-2 border-transparent bg-content1 p-4 hover:bg-content2 data-[selected=true]:border-primary"
              isDisabled={isDisabled}
              key={value}
              value={value}
            >
              {cloneElement(icon)}

              <span>{title}</span>
            </Checkbox>
          );
        })}
      </CheckboxGroup>

      <Button
        color="primary"
        isDisabled={!rootDir || modes.length === 0}
        isLoading={loading}
        onPress={handleConvert}
        size="lg"
      >
        转换
      </Button>
    </>
  );
};

export default Converter;
