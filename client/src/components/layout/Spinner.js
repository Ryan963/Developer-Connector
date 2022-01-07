import React from 'react';
import Loader from "react-loader-spinner";

const Spinner = () => {
    return (
        <section  style={{margin: 'auto', display: 'block', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
             <Loader
          type="TailSpin"
          color="#00BFFF"
          height={300}
          width={300}
          timeout={3000} //3 secs
        />
        </section>
       
      );
}

export default Spinner
