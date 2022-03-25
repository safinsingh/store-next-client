import type { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useAuth } from "hooks/useAuth";
import { useStore } from "hooks/useStore";

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
  // Store only ever renders if the authBundle is present
  const { store, error: storeError } = useStore(authBundle!);
  const onSubmit = async (data: FormData) => {
    await createAuthBundle(data.username, data.password);
  };

  return (
    <>
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
        <button onClick={() => clearAuthBundle()}>Log Out</button>
      </div>
      {authBundle !== null && store && (
        <div>
          {store.offers.map((offer) => (
            <div>
              <h1>{offer.displayName}</h1>
              <img src={offer.image} />
              <p>Tier: {offer.skinTier}</p>
            </div>
          ))}
          <span>Error fetching store: {storeError}</span>
        </div>
      )}
    </>
  );
};

export default Home;
