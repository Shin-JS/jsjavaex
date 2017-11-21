package p10.multiChat;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/** [채팅프로그램]
 * -.Multi 송신 thread객체
 **/
public class SenderThread extends Thread {
	//필드
	Socket socket;
	String name; //클라이언트 구분용 이름필드
	//생성자
	public SenderThread(Socket socket, String name) {
		this.socket = socket;
		this.name = name;
	}
	//메소드
	@Override
	public void run() {
		try {
			//입력으로 들어오는 스트림의 속도 향상을 위해 버퍼 사용
			BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
			PrintWriter writer = new PrintWriter(socket.getOutputStream()); //출력스트림
			writer.println(name); //'이름 > 메시지'의 이름 역할 담당
 			writer.flush(); //메세지 밀어내기
			while(true) {
				String str = reader.readLine(); //입력된 데이터를 한줄단위로 읽음
				if(str.equals("bye")){
					break; //입력값이 bye면 클라이언트 종료
				}
				writer.println(str); //bye가 아니면 메세지 전송
				writer.flush(); //버퍼내의 데이터 밀어내기
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}finally {
			try {
				socket.close(); //클라이언트 종료시는 반드시 소켓 해제
			} catch (Exception e2) {
			}
		}
	}
}
