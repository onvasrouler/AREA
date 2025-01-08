import { GoogleLogin, GoogleLoginProps } from '@react-oauth/google';

export function CustomGoogleLogin(props: GoogleLoginProps) {
  return (
    <div className="w-full">
      <GoogleLogin
        {...props}
        type="standard"
        size="large"
        text="signin_with"
        width="400"
        locale="en"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  );
}

