import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useAuth } from "hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Page, Input, Text, Dot, Button, Grid, Spacer } from "@geist-ui/core";

type FormData = { username: string; password: string };

const Home: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const {
    createAuthBundle,
    clearAuthBundle,
    error: authError,
    loading: authLoading,
    authBundle,
  } = useAuth();
  const router = useRouter();
  const onSubmit = async (data: FormData) => {
    await createAuthBundle(data.username, data.password);
  };

  useEffect(() => {
    if (!authLoading && authBundle) {
      router.push("/store");
    }
  }, [authLoading]);

  return (
    <Page>
      <Text h1>Login</Text>
      <Spacer h={1} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder="Username"
          {...register("username", { required: true })}
          width="100%"
        >
          {errors.username && (
            <Dot type="error">
              <Text small>This field is required</Text>
            </Dot>
          )}
        </Input>
        <Spacer h={1} />
        <Input.Password
          width="100%"
          placeholder="Password"
          {...register("password", { required: true })}
        >
          {errors.password && (
            <Dot type="error">
              <Text small>This field is required</Text>
            </Dot>
          )}
        </Input.Password>
        <Spacer h={1} />
        <Button loading={authLoading} htmlType="submit" width="100%">
          Log In
        </Button>
        <Spacer h={1} />
        <Button onClick={() => clearAuthBundle()} ghost width="100%">
          Log Out
        </Button>
      </form>
    </Page>
  );
};

export default Home;
