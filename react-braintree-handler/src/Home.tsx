import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import braintree, { Dropin } from 'braintree-web-drop-in';
import './Home.css';

interface FormErrors {
  [key: string]: string | null;
}

interface NoncePayload {
  nonce: string;
}

interface ErrorResponse {
  message: string;
}

const Home: React.FC = () => {
  const [clientToken, setClientToken] = useState(null);
  const dropinContainer = useRef(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);

  useEffect(() => {
    console.log('Fetching client token');
    axios.get('https://candii4-backend2-3f9abaacb350.herokuapp.com/client_token')
      .then(response => {
        console.log('Client token response', response);
        setClientToken(response.data.clientToken);
      })
      .catch((error: ErrorResponse) => {
        console.error("Error fetching client token:", error.message);
      });
  }, []);
  

  useEffect(() => {
    console.log('useEffect triggered for clientToken:', clientToken);
    
    if (clientToken && dropinContainer.current) {
      console.log('Creating Braintree instance');
      braintree.create({
        authorization: clientToken,
        container: dropinContainer.current,
      }, (createErr: any, instance: any) => {
        if (createErr) {
          console.error('Create error', createErr);
          return;
        }
  
        console.log('Setting dropin instance');
        setDropinInstance(instance);
      });
    } else {
      console.log('Client token or container is not ready');
      console.log('dropinContainer.current:', dropinContainer.current);
    }
  }, [clientToken]);
  

  const handlePaymentRequest = () => {
    console.log('Starting payment request');
  
    if(dropinInstance) {
      console.log('Dropin instance found, requesting payment method');
  
      dropinInstance.requestPaymentMethod()
        .then(({ nonce }: NoncePayload) => {
          console.log('Nonce received', nonce);
          console.log('Sending nonce to server for payment processing');
  
          return axios.post('https://candii4-backend2-3f9abaacb350.herokuapp.com/payment', { nonce });
        })
        .then((response: any) => {
          // Handle response
          console.log('Payment response received from server:', response.data);
        })
        .catch((error: any) => {
          if (error.message) {
            console.error('Payment error:', error.message);
          } else {
            console.error('Error during requestPaymentMethod:', error);
          }
        });
    } else {
      console.error('DropinInstance is null, unable to start payment process');
    }
  };
  

  
  return (
    <div>
      <div ref={dropinContainer} />
      <button onClick={handlePaymentRequest}>Pay</button>
    </div>
  );
};

export default Home;
