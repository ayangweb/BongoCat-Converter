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

const Synthesis = () => {
  return (
    <Form>
      <Card>
        <CardHeader>
          将部分转换存在问题的键盘与手部图片手动进行合成。
        </CardHeader>

        <Divider />

        <CardBody className="flex flex-col gap-4">
          <Input isRequired label="键盘" name="keyboard" type="file" />

          <Input isRequired label="手部" name="hand" type="file" />
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
