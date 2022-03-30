import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useAuth } from "hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/router";

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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("username", { required: true })}></input>
        {errors.username && <span>This field is required</span>}
        <input
          type="password"
          {...register("password", { required: true })}
        ></input>
        {errors.password && <span>This field is required</span>}
        <input type="submit" />
      </form>
      {authError && <span>Authorization Error: {authError}</span>}
      <button onClick={() => clearAuthBundle()}>Log Out</button>
      {authLoading && <span>loading...</span>}
    </>
  );
};

export default Home;
