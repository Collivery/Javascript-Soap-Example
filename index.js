const easySoap = require('easysoap');
let params = {
  host: 'collivery.co.za',
  path: '/ws/v2',
  wsdl: '/wsdl/v2',
  headers: {
    'app_name': 'njs_soap_test'
  },
  rejectUnauthorized: false
}
const soapClient = easySoap(params, {secure: true});

let authenticate = makeCall('authenticate', {'xsi:type': 'xsd:string'}, {
  email: 'api@collivery.co.za',
  password: 'api123',
}).catch(error => console.error(error));

authenticate.then(body => {
  // The token should be aggressively cached
  // Once it's used - it's active for another hour.
  let token = body.token;

  let data = {
    location_type: 1,
    town_id: 147,
    suburb_id: 1936,
    country: 'ZAF',
    building: 'MDS House',
    street_number: '58c',
    street: 'Webber street',
    full_name: 'Joe Soap',
    cellphone: '0721234567',
  };
  let addAddress = makeCall("add_address",{}, {data}, token);

  addAddress.then(body => {
    console.log(body);
  }).catch(error => console.error(error));
});

/**
 *
 * @param method string
 * @param attributes Object
 * @param params Object
 * @param token string
 * @return {Promise<{}>}
 */
async function makeCall(method, attributes, params, token = null)
{
  if (token) {
    params['token'] = token;
  }
  let response = await soapClient.call({method, attributes, params});

  if (response.data.hasOwnProperty('Fault')) {
    throw Error(response.data.Fault.faultstring);
  }

  // Turn the response data from `{key: {}, value: {}}[]` into `{key: value}`
  return response.data[`${method}Response`].return.item.reduce((previous, item) => {
    previous[item.key.value] = item.value.value;

    return previous;
  }, {});
}
