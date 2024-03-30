import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { SignupResponse } from './dto/signup-response';
import { SigninUserInput } from './dto/signin-user.input';
import { AuthService } from './auth.service';
import { SigninResponse } from './dto/signin-response';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { SignupUserInput } from './dto/signup-user.input';


@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}
  @Mutation(() => SignupResponse)
  async signup(
    @Args('signupUserInput') signupUserInput: SignupUserInput,
  ): Promise<SignupResponse> {
    return this.authService.signup(signupUserInput);
  }

  @Mutation(() => SigninResponse)
  @UseGuards(GqlAuthGuard)
  async signin(
    @Args('loginUserInput') loginUserInput: SigninUserInput,
    @Context() context,
  ): Promise<SigninResponse> {
    return this.authService.signin(context.user);
  }
}
