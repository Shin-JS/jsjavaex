package p05.map;

import java.util.Hashtable;
import java.util.Map;
import java.util.Scanner;

/**[List 컬렉션]
 * Map
 * HashTable
 * Thread-safe: 멀티쓰레드환경에서 자료를 보호할 수 있는 구조
 **/
public class HashTableExample {
	public static void main(String[] args) {
		Map<String, String> map = new Hashtable<>();
		
		map.put("spring", "1234");
		map.put("summer", "123");
		map.put("fall", "1234");
		map.put("winter", "12345");
		
		Scanner scanner = new Scanner(System.in);
		while(true) {
			System.out.println("아이디와 패스워드를 입력하세요");
			System.out.print("아이디: ");
			String id = scanner.next();
			System.out.print("패스워드: ");
			String password = scanner.next();
			
			if(map.containsKey(id)) { //<키,값>으로 저장된 자료에서 키 부분만 검색
				if(map.get(id).equals(password)) {
					System.out.println("로그인완료");
					break;
				}else {
					System.out.println("비밀번호가 일치하지 않습니다.");
				}
			}else {
				System.out.println("입력한 아이디가 존재하지 않습니다.");
			}
			
		}
		
	}
}
