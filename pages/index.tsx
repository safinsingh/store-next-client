import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";

type FormData = { username: string; password: string };

const Home: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const {
    authBundle,
    createAuthBundle,
    clearAuthBundle,
    error: authError,
  } = useAuth();
  const onSubmit = async (data: FormData) => {
    await createAuthBundle(data.username, data.password);
  };

  return (
    <div>
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
    </div>
  );
};

export default Home;
