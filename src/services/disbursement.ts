import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IDisbursementInput } from '../interfaces/IDisbursement';
import { IDisbursementInstrumentInput } from '../interfaces/IDisbursementInstrument';

import { Container } from 'typedi';

import Disbursement from '../models/disbursement';
import config from '../config'
import { response } from 'express';
const axios = require('axios');

@Service()

export default class DisbursementService {
    constructor(
        @Inject('disbursementModel') private disbursementModel: Models.disbursementModel,
        @Inject('disbursementInstrument') private disbursementInstrument: Models.disbursementInstrument,

        @Inject('logger') private logger,
    ) { }


    public async CreateDisbursement(disbursementInputDTO: IDisbursementInput): Promise<any> {
        try {
            const disbursementRecord = await Disbursement.create(disbursementInputDTO);
            // const disbursementRecord = {};
            if (!disbursementRecord) {
                throw new Error('disbursementRecord cannot be created');
            }
            const disbursementData = disbursementRecord.toObject();
            return { disbursementData };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async addDisbursementV1(hash, axiosBody, disbursementInputDTO: IDisbursementInput) {
        try {
            var userdata1 = {};
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash, aptoken: config.aptoken },
            };
            let mainres = await axios
                .post(`${config.APTPAY_Sandbox_API}disbursements/add`, axiosBody, options)
                .then(async Response => {
                    userdata1 = Response.data;
                    return userdata1
                })
                .catch(error => {
                    console.error(error.response.data)
                    throw error.response.data;
                });
            if (mainres) {
                var disbursementDetail = await this.disbursementModel.create(
                    {
                        ...disbursementInputDTO,
                        disbursementId: mainres.id,
                        status: mainres.status
                    }
                )
            }
            return mainres

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getDisbursementStatus(hash, disbursement_id) {

        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };
        let mainres = await axios
            .get(`${config.APTPAY_Sandbox_API}disbursements/${disbursement_id}`, options)
            .then(async Response => {
                userdata1 = Response.data;
                return userdata1
            }).catch(error => {
                console.error(error.response.data)
                throw new Error(error.response.data.errors);
            });
        return mainres;
    }
    public async checkAccount(hash, axiosBody) {

        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash, aptoken: config.aptoken },
        };

        let mainres = await axios
            .post(`${config.APTPAY_Sandbox_API}account/check`, axiosBody, options)
            .then(async Response => {
                userdata1 = Response.data;
                return userdata1

            }).catch(error => {
                console.error(error.response.data)
                throw new Error(error.response.data.errors);
            });
        return mainres;
    }
    public async addDisbursementInstrument(hash, axiosBody, body: IDisbursementInstrumentInput) {
        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };
        let mainres = await axios
            .post(`${config.APTPAY_Sandbox_API}disbursement-instrument/add`, axiosBody, options)
            .then(async Response => {
                // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
                userdata1 = Response.data;
                // console.log(userdata1)
                return userdata1
            }).catch(error => {
                
                console.error(error.response.data)
                throw error.response.data.errors;
            });
        if (mainres) {
            var disbursementInstrumentDetail = await this.disbursementInstrument.find({ payeeId: body.payeeId, disbursementNumber: body.disbursementNumber })
            if (disbursementInstrumentDetail.length != 0) {
                var InstrumentDetail = await this.disbursementInstrument.findOneAndUpdate(
                    { payeeId: body.payeeId },
                    {
                        $set:
                        {
                            expirationDate: body.expirationDate,
                            isDeleted: false,
                            instrumentId: mainres.id,
                            status: mainres.status
                        }
                    }
                )
            } else {
                var InstrumentDetail = await this.disbursementInstrument.create(
                    {
                        ...body,
                        instrumentId: mainres.id,
                        status: mainres.status
                    }
                )
            }

        }
        return mainres;
    }
    public async getDisbursementInstrument(hash, instrumentId) {

        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        let mainres = await axios
            .get(`${config.APTPAY_Sandbox_API}disbursement-instrument/${instrumentId}`, options)
            .then(async Response => {
                // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
                userdata1 = Response.data;
                return userdata1

            }).catch(error => {
                console.error(error.response.data)
                throw new Error(error.response.data.errors);
            });
        return mainres;
    }
    public async getListofDisbursementInstruments(hash, payeeId) {
        try {
            let userdata1 = {};
            const options = {
                headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
            };

            let mainres = await axios
                .get(`${config.APTPAY_Sandbox_API}disbursement-instrument/list/${payeeId}`, options)
                .then(async Response => {
                    userdata1 = Response.data;
                    return userdata1

                }).catch(error => {
                    console.error(error.response.data)
                    throw new Error(error.response.data.errors);
                });
            return mainres;
        } catch (error) {
            console.log('error', error);
            throw new Error(error.response.data.errors);
        }

    }
    public async deleteInstrument(hash, instrumentId) {

        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash },
        };

        let mainres = await axios
            .delete(`${config.APTPAY_Sandbox_API}disbursement-instrument/${instrumentId}`, options)
            .then(async Response => {
                // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
                userdata1 = Response.data;
                return userdata1

            }).catch(error => {
                console.error(error.response.data)
                throw new Error(error.response.data.errors);
            });
        if (mainres != undefined) {
            var InstrumentDetail: any = await this.disbursementInstrument.findOne({ instrumentId: instrumentId })
            console.log('ins', InstrumentDetail);
            let dltData: any = {};

            if (InstrumentDetail.isDeleted == false) {
                var deleteInstrument = await this.disbursementInstrument.findOneAndUpdate({ instrumentId: instrumentId }, { $set: { isDeleted: true } });
            }
        }
        return mainres;
    }
    public async kycCheck(hash, axiosBody) {

        let userdata1 = {};
        const options = {
            headers: { AptPayApiKey: config.API_Key, 'Content-Type': 'application/json', 'body-hash': hash, aptoken: config.aptoken },
        };

        let mainres = await axios
            .post(`${config.APTPAY_Sandbox_API}kyc-check`, axiosBody, options)
            .then(async Response => {
                // const { userdata } = await authServiceInstance.updateAptCardId(Response.data.id, user._id);
                userdata1 = Response.data;
                return userdata1

            }).catch(error => {
                console.error(error.response.data)
                throw new Error(error.response.data.errors);
            });
        return mainres;
    }

}