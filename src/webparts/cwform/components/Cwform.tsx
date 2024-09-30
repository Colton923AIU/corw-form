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

const schema = yup.object({
  AAFAAdvisor: yup.array().required('AAFA Advisor is required'),
  CDOA: yup.string().required('CDOA is required'),
  DSM: yup.string().required('DSM is required'),
  CorW: yup
    .string()
    .oneOf(
      ['Cancel', 'Withdrawal'],
      'Please select either Cancel or Withdrawal'
    )
    .required('Please select Cancel or Withdrawal'),
  StudentId: yup.string().required('Student ID is required'),
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
  console.log('userData: ', userData);
  const onSave = () => {
    handleSubmit(
      data => {
        console.log('formListUrl: ', formList);
        console.log(data);
      },
      err => {
        console.log(err);
      }
    )();
  };
  console.log('useForm Errors: ', errors);

  if (userData === null) return <>loading...</>;
  return (
    <section className={styles.cwform}>
      <h2>Cancel / Withdrawal Form</h2>
      <form onSubmit={handleSubmit(onSave)}>
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
          errorMessage={errors.StudentId?.message}
          control={control}
          name="StudentId"
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
          errorMessage={errors.AAFAAdvisor?.message}
          control={control}
          name="AAFAAdvisor"
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
        />
        <ControlledTextField
          errorMessage={errors.DSM?.message}
          control={control}
          name="DSM"
          label="DSM"
          type="text"
          disabled={true} // Set to true or false based on your requirements
        />
        <PrimaryButton type="submit" text="Submit" />
      </form>
    </section>
  );
};

export default Cwform;
