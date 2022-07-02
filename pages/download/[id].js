import { useState } from "react";
// import client from "../../apollo-client";
import Lit from "../utils/getLit";

export default function Download({project}) {

    return (
        <div>
          hi
        </div>
    )
}


// export async function getServerSideProps(context) {
//     const { id } = context.params;
//     console.log(id);
  
//     const { data } = await client.query({
//       query: gql`
//         query Project($id: String!) {
//           project(id: $id) {
//           }
//         }
//       `,
//       variables: {
//         id: id,
//       },
//     });
  
//     return {
//       props: {
//         project: data.project,
//       },
//     };
//   }