import { addToast, Button, Checkbox, CheckboxGroup } from "@heroui/react";
import { decode } from "base64-arraybuffer";
import {
  directoryOpen,
  type FileWithDirectoryAndFileHandle,
} from "browser-fs-access";
import clsx from "clsx";
import { last, sum } from "es-toolkit";
import { find, map } from "es-toolkit/compat";
import { filesize } from "filesize";
import { Folder, FolderOpen, Gamepad2, Keyboard, Mouse, X } from "lucide-react";
import mergeImages from "merge-images";
import { cloneElement, useState } from "react";
import {
  APP_NAME,
  CONFIG_FILE_NAME,
  LEFT_KEYS_DIR_NAME,
  LEGACY_APP_NAME,
  MODE,
  MODE_CN,
  MODEL_DIR_NAME,
  ORIGINAL_BG_NAME,
  ORIGINAL_COVER_NAME,
  OUTPUT_BG_NAME,
  OUTPUT_COVER_NAME,
  RESOURCES_NAME,
} from "@/constants";
import type { ConfigSchema } from "@/types";
import { join, safeRemoveEntry, writeFile } from "@/utils/fsExtra";
import { keyMap } from "@/utils/keyMap";

interface RootDir {
  name: string;
  size: string;
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

      const configHandle = find(handles, { name: CONFIG_FILE_NAME });

      if (!configHandle) {
        return addToast({
          color: "danger",
          title: `未找到 ${CONFIG_FILE_NAME} 文件，请选择正确的应用文件夹。`,
        });
      }

      const configText = await configHandle.text();
      setConfigSchema(JSON.parse(configText));

      const rootHandle = configHandle.directoryHandle!;
      const dirSize = sum(map(handles, "size"));
      setRootDir({
        handle: rootHandle,
        name: rootHandle.name,
        size: filesize(dirSize),
      });

      setHandles(handles);
    } catch (error) {
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

        // 删除旧文件夹
        await safeRemoveEntry(rootDir.handle, outputDir, { recursive: true });

        const modelHandles = handles.filter((handle) => {
          return handle.webkitRelativePath.includes(join(mode, MODEL_DIR_NAME));
        });

        // 复制模型相关文件
        for await (const handle of modelHandles) {
          const originalPath = last(
            handle.webkitRelativePath.split(MODEL_DIR_NAME),
          )!;
          const path = join(outputDir, originalPath);
          const data = await handle.arrayBuffer();

          await writeFile(rootDir.handle, path, data);
        }

        // 复制背景图片
        await copyBgImage(mode, outputDir);

        // 复制封面图片
        await copyCoverImage(mode, outputDir);

        const keyboardHandles = handles.filter((handle) => {
          return handle.webkitRelativePath.includes(`${mode}/keyboard`);
        });

        if (mode === MODE.STANDARD) {
          const handHandles = handles.filter((handle) => {
            return handle.webkitRelativePath.includes(`${mode}/hand`);
          });

          for (const [index, [key]] of configSchema.standard.hand.entries()) {
            const keyboardHandle = find(keyboardHandles, {
              name: `${index}.png`,
            });
            const handHandle = find(handHandles, {
              name: `${index}.png`,
            });

            if (keyboardHandle && handHandle) {
              const data1 = await keyboardHandle.arrayBuffer();
              const data2 = await handHandle.arrayBuffer();
              const blob1 = new Blob([data1], { type: "image/png" });
              const blob2 = new Blob([data2], { type: "image/png" });
              const url1 = URL.createObjectURL(blob1);
              const url2 = URL.createObjectURL(blob2);
              const base64 = await mergeImages([url1, url2]);

              const path = join(
                outputDir,
                join(RESOURCES_NAME, LEFT_KEYS_DIR_NAME, `${keyMap[key]}.png`),
              );
              const data = decode(base64.replace("data:image/png;base64,", ""));

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

  const copyBgImage = async (mode: string, outputDir: string) => {
    if (!rootDir) return;

    const handle = handles.find((item) => {
      return item.webkitRelativePath.includes(
        join(mode, ORIGINAL_BG_NAME[mode]),
      );
    });

    if (!handle) return;

    const path = join(outputDir, RESOURCES_NAME, OUTPUT_BG_NAME);
    const data = await handle.arrayBuffer();

    return writeFile(rootDir.handle, path, data);
  };

  const copyCoverImage = async (mode: string, outputDir: string) => {
    if (!rootDir) return;

    const handle = handles.find((item) => {
      return item.webkitRelativePath.includes(join(mode, ORIGINAL_COVER_NAME));
    });

    if (!handle) return;

    const path = join(outputDir, RESOURCES_NAME, OUTPUT_COVER_NAME);
    const data = await handle.arrayBuffer();

    return writeFile(rootDir.handle, path, data);
  };

  return (
    <>
      <div
        className={clsx(
          "cursor-pointer rounded-lg border-2 border-default p-8 transition hover:border-primary hover:bg-primary-50",
          {
            "pointer-events-none opacity-50": loading,
          },
        )}
        onClick={handleSelect}
      >
        {rootDir ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Folder className="size-8 text-primary" />

              <div className="flex flex-col gap-1">
                <span className="font-bold">{rootDir.name}</span>
                <span className="text-foreground-500">{rootDir.size}</span>
              </div>
            </div>

            <Button
              color="danger"
              isIconOnly
              onPress={handleDeselect}
              variant="light"
            >
              <X className="size-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <FolderOpen className="size-10 text-primary" />

            <h3 className="font-semibold text-lg">选择应用文件夹</h3>

            <p className="text-foreground-500">
              {`请选择完整的 ${LEGACY_APP_NAME} 应用文件夹，其子目录中应包含 ${CONFIG_FILE_NAME} 文件。`}
            </p>
          </div>
        )}
      </div>

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
        {loading ? "正在转换..." : "开始转换"}
      </Button>
    </>
  );
};

export default Converter;
