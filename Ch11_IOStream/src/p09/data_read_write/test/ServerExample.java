package p09.data_read_write.test;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;

/**[네트워크]
 * -.서버: 자료를 제공하는 객체, 서버는 ServerSocket을 가진다
 **/
public class ServerExample {
	public static void main(String[] args) {
		ServerSocket serverSocket = null; //서버소켓 객체 선언
		try {
			serverSocket = new ServerSocket(); //서버소켓 객체 생성	
			//서버소켓의 주소 및 port번호 세팅
			serverSocket.bind(new InetSocketAddress("localhost", 5001));
			while(true) {
				System.out.println("[연결기다림]");
				Socket socket = serverSocket.accept(); //요청이 들어오면 accept()메소드로 소켓 생성
				InetSocketAddress isa = (InetSocketAddress) socket.getRemoteSocketAddress(); //요청이 들어온 client의 주소정보를 얻어옴
				System.out.println("[연결수락함]"+isa.getHostName());
				System.out.println("====연결완료====");
				byte[] bytes = null; //byte단위의 메세지 저장용 배열
				String message = null;
				InputStream is = socket.getInputStream(); //socket으로 들어오는 스트림 얻기
				bytes = new byte[100]; //byte단위의 값을 읽어들여 저장하는 배열
				int readByteCnt = is.read(bytes);//읽어들인마큼 배열에 저장 후 저장된갯수를 readByteCnt에 대입
				message = new String(bytes,0,readByteCnt); //메세지 생성
				readByteCnt = is.read(bytes);
				String message2 = new String(bytes,0,readByteCnt);
				readByteCnt = is.read(bytes);
				String message3 = new String(bytes,0,readByteCnt);
				System.out.println("[데이터 받기 성공]:" +"숫자1: "+message +",숫자2: "+message2+",연산자: "+message3);
				//---------------------------- 전송받은 메세지 출력완료---------------------
				OutputStream os = socket.getOutputStream(); //출력객체 생성
				Integer int1 = new Integer(message);
				Integer int2 = new Integer(message2);
				String result = "";
				switch(message3) {
				case "+": 
					int sum = int1+int2;
					result = String.valueOf(sum);
					bytes = result.getBytes();
					os.write(bytes);
					os.flush();
					System.out.println("[데이터 보내기 성공]");
					break;
				case "-": 
					int minus = int1-int2;
					result = String.valueOf(minus);
					bytes = result.getBytes();
					os.write(bytes);
					os.flush();
					System.out.println("[데이터 보내기 성공]");
					break;
				case "*": 
					int product = int1*int2;
					result = String.valueOf(product);
					bytes = result.getBytes();
					os.write(bytes);
					os.flush();
					System.out.println("[데이터 보내기 성공]");
					break;
				case "/": 
					int divide = int1/int2;
					result = String.valueOf(divide);
					bytes = result.getBytes();
					os.write(bytes);
					os.flush();
					System.out.println("[데이터 보내기 성공]");
					break;
				}
				
//				message = "Hello Client";
//				bytes = message.getBytes(); //String.getBytes()→문자열을 byte배열로 변환
//				os.write(bytes); //전송
//				os.flush(); //메세지 밀어내기
//				bytes = message2.getBytes();
//				os.write(bytes);
//				os.flush();
//				System.out.println("[데이터 보내기 성공]");
				
				is.close();
				os.close();
				socket.close(); //소켓 종료

			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
		//서버소켓 종료시 client와 연결이 있으면 연결을 끊은 후 종료
		if(!serverSocket.isClosed()) {
			try {
				serverSocket.close();
			} catch (IOException e) {
				System.out.println(e.getMessage());
			}
		}
		
	}
}
