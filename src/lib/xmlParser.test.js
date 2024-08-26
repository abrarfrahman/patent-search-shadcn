import { parseClaimsXml } from './xmlParser';

describe('parseClaimsXml', () => {
  it('should correctly parse valid XML claims', async () => {
    const xml = `
    <claims> mxw-id="PCLM109518226" lang="EN" load-source="patent-office">
        <claim-statement>
            <!--  EPO <DP n="11"/> -->
            Claims What is claimed is:
        </claim-statement>
        <claim id="clm-0001" num="1">
            <claim-text>1. A non-transitory computer-readable storage medium comprising instructions that when executed cause a processor of a computing device to: in response to establishing a connection between the computing device and a first electronic device, request descriptor information of a second electronic device connected to the computing device via a universal serial bus (USB) interface of the computing device;
            </claim-text>
            <claim-text>identify calibration data of a third electronic device connected to the computing device based on the descriptor information, wherein the calibration data is stored at the second electronic device; and control the first electronic device using the calibration data.</claim-text>
        </claim>
        <claim id="clm-0002" num="2">
            <claim-text>2. The non-transitory computer-readable storage medium of claim 1, wherein the descriptor information includes an identifier string and the calibration data, wherein the identifier string indicates a presence of the calibration data in the descriptor information.</claim-text>
        </claim>
    </claims>
    `;

    const expected = [
      {
        id: 'clm-0001',
        num: '1',
        subclaims: ['1. A non-transitory computer-readable storage medium comprising instructions that when executed cause a processor of a computing device to: in response to establishing a connection between the computing device and a first electronic device, request descriptor information of a second electronic device connected to the computing device via a universal serial bus (USB) interface of the computing device;', 
                    'identify calibration data of a third electronic device connected to the computing device based on the descriptor information, wherein the calibration data is stored at the second electronic device; and control the first electronic device using the calibration data.']
      },
      {
        id: 'clm-0002',
        num: '2',
        subclaims: ['2. The non-transitory computer-readable storage medium of claim 1, wherein the descriptor information includes an identifier string and the calibration data, wherein the identifier string indicates a presence of the calibration data in the descriptor information.']
      }
    ];

    const claims = await parseClaimsXml(xml);
    expect(claims).toEqual(expected);
  });

  it('should handle malformed XML gracefully', async () => {
    const xml = `
      <claims>
        <claim id="clm-0001" num="1">
          <claim-text>1. A non-transitory computer-readable storage medium...</claim-text>
        </claim>
      </claims>
    `;

    const expected = [
      {
        id: 'clm-0001',
        num: '1',
        subclaims: ['1. A non-transitory computer-readable storage medium...']
      }
    ];

    const claims = await parseClaimsXml(xml);
    expect(claims).toEqual(expected);
  });
});
