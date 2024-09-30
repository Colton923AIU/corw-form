import * as React from 'react';
import styles from './Cwform.module.scss';
import { ICwformWebPartProps } from '../CwformWebPart';
import { useData } from '../hooks';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PrimaryButton } from '@fluentui/react';
import ControlledDatePicker from '../controlledFields/ControlledDatePicker/ControlledDatePicker';
import ControlledDropdown from '../controlledFields/ControlledDropdown/ControlledDropdown';
import ControlledPeoplePicker from '../controlledFields/ControlledPeoplePicker/ControlledPeoplePicker';
import ControlledTextField from '../controlledFields/ControlledTextField/ControlledTextField';
import { SPHttpClient } from '@microsoft/sp-http';
import getUserIdByemail from '../helpers/getUserByEmail/getUserByEmail';

const schema = yup.object({
  AA_x002f_FAAdvisor: yup.array().required('AAFA Advisor is required'),
  CDOA: yup.string().required('CDOA is required'),
  DSM: yup.string().required('DSM is required'),
  CorW: yup
    .string()
    .oneOf(
      ['Cancel', 'Withdrawal'],
      'Please select either Cancel or Withdrawal'
    )
    .required('Please select Cancel or Withdrawal'),
  StudentID: yup.string().required('Student ID is required'),
  StudentName: yup
    .string()
    .min(2, 'Must type full name')
    .required('Student Name is required'),
  StartDate: yup.date().required('Start Date is required'),
  Notes: yup.string().when('CorW', {
    is: (val: string) => val === 'Withdrawal',
    then: () =>
      yup
        .string()
        .min(10, 'Must provide more detail')
        .required('Notes are required for Withdrawal'),
  }),

  DocumentedInNotes: yup.string().when('CorW', {
    is: (val: string) => val === 'Withdrawal',
    then: () =>
      yup.string().required('Documented in Notes is required for Withdrawal'),
    otherwise: () => yup.string().notRequired(),
  }),
  InstructorName: yup.string().when('CorW', {
    is: (val: string) => val === 'Withdrawal',
    then: () =>
      yup.string().required('Instructor Name is required for Withdrawal'),
    otherwise: () => yup.string().notRequired(),
  }),
  ESA: yup.bool().when('CorW', {
    is: (val: string) => val === 'Withdrawal',
    then: () => yup.string().required('ESA is required for Withdrawal'),
    otherwise: () => yup.string().notRequired(),
  }),
});

interface FormFields extends yup.InferType<typeof schema> {}

const Cwform: React.FC<ICwformWebPartProps> = ({
  absoluteUrl,
  cdoaToDSMListURL,
  context,
  formList,
  spHttpClient,
}) => {
  const userData = useData({
    absoluteUrl: absoluteUrl,
    spHttpClient: spHttpClient,
    spListLink: cdoaToDSMListURL,
  });
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: {
      StartDate: new Date(),
    },
    reValidateMode: 'onBlur',
    mode: 'all',
  });

  if (userData === null) return <>loading...</>;
  return (
    <section className={styles.cwform}>
      <h2>Cancel / Withdrawal Form</h2>
      <form
        onSubmit={handleSubmit(async data => {
          if (!userData) return;
          const CDOA = userData.filter(item => {
            if (item.CDOA.Id === parseInt(data.CDOA)) {
              return true;
            }
          })[0].CDOA;

          const DSM = userData.filter(item => {
            if (item.DSM.Title === data.DSM) {
              return true;
            }
          })[0].DSM;
          const validData: any = data;
          validData.CDOANameId = CDOA.Id;
          validData.CDSMId = DSM.Id;
          validData.StudentID = parseInt(data.StudentID);
          (validData.AA_x002f_FAAdvisorId = await getUserIdByemail({
            spHttpClient: spHttpClient,
            email: data.AA_x002f_FAAdvisor[0].secondaryText,
          }).then(data => {
            return data.Id;
          })),
            delete validData.CDOA;
          delete validData.DSM;
          delete validData.AA_x002f_FAAdvisor;

          console.log(validData);

          spHttpClient
            .post(formList, SPHttpClient.configurations.v1, {
              body: JSON.stringify(validData),
            })
            .then((response: any) => {
              if (!response.ok) {
                return response.json().then((err: any) => {
                  throw new Error(JSON.stringify(err));
                });
              }
              return response.json();
            })
            .then((data: any) => {
              console.log('Success:', data);
            })
            .catch((error: any) => {
              console.log('Fail:', error);
            });
        })}
      >
        <ControlledDropdown
          errorMessage={errors.CorW?.message}
          control={control}
          name="CorW"
          label="Request Type"
          options={[
            { key: 'Cancel', text: 'Cancel' },
            { key: 'Withdrawal', text: 'Withdrawal' },
          ]}
          onChange={option => {
            // setCorwState(option === 'Withdrawal' ? true : false)
            setValue('CorW', option);
          }}
        />
        <ControlledTextField
          errorMessage={errors.StudentName?.message}
          control={control}
          name="StudentName"
          label="Student Name"
        />
        <ControlledTextField
          errorMessage={errors.StudentID?.message}
          control={control}
          name="StudentID"
          label="Student ID"
          type="number"
        />
        <ControlledDatePicker
          control={control}
          name="StartDate"
          label="Current Start Date"
        />
        {/* {corwState ? ( */}
        {watch('CorW') === 'Withdrawal' ? (
          <>
            <ControlledTextField
              errorMessage={errors.Notes?.message}
              control={control}
              name="Notes"
              label="Student's Exact Written Request"
              type="text"
            />
            <ControlledDropdown
              errorMessage={errors.DocumentedInNotes?.message}
              control={control}
              name="DocumentedInNotes"
              label="Documented in Notes"
              options={[
                { key: 'yes', text: 'Yes' },
                { key: 'no', text: 'No' },
              ]}
            />
            <ControlledTextField
              errorMessage={errors.InstructorName?.message}
              control={control}
              name="InstructorName"
              label="Instructor Name"
              type="text"
            />
            <ControlledDropdown
              errorMessage={errors.ESA?.message}
              control={control}
              name="ESA"
              label="ESA"
              options={[
                { key: 'yes', text: 'Yes' },
                { key: 'no', text: 'No' },
              ]}
            />
          </>
        ) : null}
        <ControlledPeoplePicker
          errorMessage={errors.AA_x002f_FAAdvisor?.message}
          control={control}
          name="AA_x002f_FAAdvisor"
          context={context}
          titleText="Financial Aid Advisor (AA or FA to be notified)"
          personSelectionLimit={1}
          disabled={false}
          searchTextLimit={5}
        />
        <ControlledDropdown
          errorMessage={errors.CDOA?.message}
          control={control}
          name="CDOA"
          label="CDOA Name"
          options={userData.map(item => ({
            key: item.CDOA.Id.toString(),
            text: item.CDOA.Title,
          }))}
          onChange={val => {
            const DSMValue = userData?.filter(item => {
              if (item.CDOA.Id === parseInt(val)) {
                return true;
              }
            })[0].DSM.Title;
            setValue('DSM', DSMValue);
          }}
        />
        <ControlledTextField
          errorMessage={errors.DSM?.message}
          control={control}
          name="DSM"
          label="DSM"
          type="text"
          disabled={true} // Set to true or false based on your requirements
        />
        <PrimaryButton
          type="submit"
          text="Submit"
          style={{ marginTop: '5px' }}
        />
      </form>
    </section>
  );
};

export default Cwform;
