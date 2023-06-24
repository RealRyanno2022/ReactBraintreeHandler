import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import braintree, { Dropin } from 'braintree-web-drop-in';
import './Payment.css';

interface FormErrors {
  [key: string]: string | null;
}

const Home: React.FC = () => {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const dropinContainer = useRef<HTMLDivElement>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [dropinInstance, setDropinInstance] = useState<Dropin | null>(null);

  useEffect(() => {
    axios.get('/api/braintree/getClientToken')
      .then(response => {
        setClientToken(response.data.clientToken);
      })
      .catch(error => {
        console.error("Error fetching client token:", error);
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
      });
    }
  }, [clientToken]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dropinInstance) {
      console.error('Dropin instance not ready');
      return;
    }

    dropinInstance.requestPaymentMethod()
      .then(({ nonce }) => {
        return axios.post('/api/braintree/processPayment', { nonce });
      })
      .then(response => {
        // Handle response
        console.log('Payment response:', response.data);
      })
      .catch(error => {
        // Handle error
        console.error('Payment error:', error);
      });
  };

  return (
    <div ref={dropinContainer}>
      <form id="paymentForm" onSubmit={handleFormSubmit}>
        <button id="submit-button" type="submit">Confirm Payment</button>
      </form>
    </div>
  );
};

export default Home;
