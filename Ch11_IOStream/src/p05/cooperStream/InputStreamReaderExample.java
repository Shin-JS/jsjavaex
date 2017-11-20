package p05.cooperStream;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;

/**[보조스트림]
 * -.byte단위의 입력데이터를 char단위의 데이터로 변환하는 보조 스트림: InputStreamReader
 * ex)abcdef 키보드로 입력 → ascii코드값인 byte값들이 스트림으로 이동 → read(cbuf) = cbuf:[a][b][c][d][e][f], readCharNo = 6; → new String(cbuf,0,6);
 *    data = "abcdef"
 **/
public class InputStreamReaderExample {
	public static void main(String[] args) {
		InputStream is = System.in; //콘솔(키보드)로부터 byte단위의 입력
		Reader reader = new InputStreamReader(is); //Reader객체는 char단위 스트림
		int readCharNo;
		char[] cbuf = new char[100];
		try {
			while((readCharNo=reader.read(cbuf))!=-1) {
				String data = new String(cbuf,0,readCharNo);
				System.out.println(data);
				/*while(true){
				 * readCharNo = reader.read(cbuf);
				 * if(readCharNo==-1){
				 * break; //더이상 읽은 데이터가 없으면 break;
				 * }
				 * String data = new String(cbuf,0,readCharNo);
				 * System.out.println(data);
				 * */
			}
			reader.close(); //스트림 자원해제
		} catch (IOException e) {
			System.out.println(e.getMessage());
		}
	}
}
