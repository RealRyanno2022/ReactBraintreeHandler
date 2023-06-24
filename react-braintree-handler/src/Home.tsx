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
  const [clientToken, setClientToken] = useState<string | null>(null);
  const dropinContainer = useRef<HTMLDivElement>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);

  useEffect(() => {
    axios.get('https://candii4-backend2-3f9abaacb350.herokuapp.com/client_token')
      .then(response => {
        setClientToken(response.data.clientToken);
      })
      .catch((error: ErrorResponse) => {
        console.error("Error fetching client token:", error.message);
      });
  }, []);

  useEffect(() => {
    if (clientToken && dropinContainer.current) {
      braintree.create({
        authorization: clientToken,
        container: dropinContainer.current,
      }, (createErr: any, instance: any) => {
        if (createErr) {
          console.error('Create error', createErr);
          return;
        }
        setDropinInstance(instance);
        // Immediately request the payment method
        instance.requestPaymentMethod()
        .then(({ nonce }: NoncePayload) => {
          return axios.post('https://candii4-backend2-3f9abaacb350.herokuapp.com/payment', { nonce });
        })
        .then((response: any) => {
          // Handle response
          console.log('Payment response:', response.data);
        })
        .catch((error: ErrorResponse) => {
          // Handle error
          console.error('Payment error:', error.message);
        });
      });
    }
  }, [clientToken]);

  return (
    <div ref={dropinContainer} />
  );
};

export default Home;
