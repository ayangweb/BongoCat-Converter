import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Form,
  Input,
} from "@heroui/react";
import { useRef } from "react";

const Synthesis = () => {
  const keyboardFileRef = useRef<HTMLInputElement>(null);
  const handFileRef = useRef<HTMLInputElement>(null);

  return (
    <Form>
      <Card>
        <CardHeader>
          将部分转换存在问题的键盘与手部图片手动进行合成。
        </CardHeader>

        <Divider />

        <CardBody className="flex flex-col gap-4">
          <Input
            isRequired
            label="键盘"
            name="keyboard"
            onFocus={() => keyboardFileRef.current?.click()}
            ref={keyboardFileRef}
            type="file"
          />

          <Input
            isRequired
            label="手部"
            name="hand"
            onFocus={() => handFileRef.current?.click()}
            ref={handFileRef}
            type="file"
          />
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-end">
          <Button color="primary" type="submit">
            合成
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
};

export default Synthesis;
