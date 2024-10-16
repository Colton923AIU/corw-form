import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
import Cwform from './components/Cwform';
import { IPeoplePickerContext } from '@pnp/spfx-controls-react/lib/PeoplePicker';

export interface ICwformWebPartProps {
  absoluteUrl: string;
  context: IPeoplePickerContext;
  spHttpClient: SPHttpClient;
  cdoaToDSMListURL: string;
  formList: string;
}

export default class CwformWebPart extends BaseClientSideWebPart<ICwformWebPartProps> {
  public render(): void {
    const element: React.ReactElement<ICwformWebPartProps> =
      React.createElement(Cwform, {
        absoluteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: {
          absoluteUrl: this.context.pageContext.web.absoluteUrl,
          msGraphClientFactory: this.context.msGraphClientFactory,
          spHttpClient: this.context.spHttpClient,
        },
        cdoaToDSMListURL: `https://livecareered.sharepoint.com/sites/AIU/Lists/CDOA%20to%20DSM%20Map/AllItems.aspx`,
        formList: `https://livecareered.sharepoint.com/sites/Forms/_api/web/Lists/getbytitle('Cancel%20or%20Withdrawal%20Request%20Form%20Test')/items`,
      });

    ReactDom.render(element, this.domElement);
  }
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [],
    };
  }
}
