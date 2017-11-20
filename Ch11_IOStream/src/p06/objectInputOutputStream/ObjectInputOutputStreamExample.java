package p06.objectInputOutputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Arrays;

/** [객체입출력]
 * -.객체의 입출력
 * -.기본객체(Number, Primitive타입의 배열, String)의 입출력: Serializable인터페이스로 구현되어있기 때문에 파일에 저장(직렬화)과 파일로부터
 *                                                            읽어들이기(역직렬화)가 가능
 **/
public class ObjectInputOutputStreamExample {
	public static void main(String[] args) {
		File f = new File("c:/temp/Object.dat");
		FileOutputStream fos;
		ObjectOutputStream oos; //Object를 출력하는 스트림
		ObjectInputStream ois; //Object를 입력하는 스트림
		try {
			//객체 생성
			oos = new ObjectOutputStream(new FileOutputStream(f));
			//파일에 객체 기록(객체의 내용을 기록)
			oos.writeObject(new Integer(10)); //Wrapper클래스(객체)
			oos.writeObject(new Double(3.14)); //Wrapper클래스(객체)
			oos.writeObject(new int[] {1,2,3}); //Array(객체)
			oos.writeObject(new String("홍길동")); //String(객체)
			oos.flush(); //밀어내기
			oos.close(); //자원해제
			System.out.println("=============================");
			ois = new ObjectInputStream(new FileInputStream(f)); //입력통로 생성
			Integer obj1 = (Integer)ois.readObject(); //객체를 읽어들임, 리턴타입Object
			Double obj2 = (Double)ois.readObject(); //객체를 읽어들임, 리턴타입Object
			int[] obj3 = (int[])ois.readObject(); //객체를 읽어들임, 리턴타입Object
			String obj4 = (String)ois.readObject(); //객체를 읽어들임, 리턴타입Object
			//자원해제
			ois.close();
			System.out.println(obj1);
			System.out.println(obj2);
			System.out.println(Arrays.toString(obj3));
			System.out.println(obj4);
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		
	}
}
