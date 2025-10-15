import jetEnv, { num, str } from "jet-env";
import { isEnumVal } from "jet-validators";

import { NodeEnvs } from ".";

/******************************************************************************
                                 Setup
******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
  Host: str,
  Db: {
    Host: str,
    Port: num,
    Name: str,
    User: str,
    Password: str,
  },
  ClientOrigin: str,
});

/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;
