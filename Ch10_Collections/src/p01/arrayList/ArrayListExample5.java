package p01.arrayList;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

/**[List 컬렉션]
 * ArrayList
 **/
public class ArrayListExample5 {
	public static void main(String[] args) {
		//홍길동,일지매,임꺽정,이순신 값을 입력받아서 리스트를 만들고,
		//입력된 객체의 갯수만큼 반복해서 index번호 0번지의 값을 삭제하는 코드
		Scanner scanner = new Scanner(System.in);
		List<String> list = new ArrayList<>();
		list=Collections.synchronizedList(list); //동기화 된거임...
		String str;
		for(int i = 0; i < 4; i++) {
			System.out.println(i+1);
			str = scanner.next();
			list.add(str);
		}

		while(true) {
			for(String s:list) {
				System.out.println("리스트에 존재하는값");
				System.out.println(s);
			}
			System.out.println("삭제된값");
			System.out.println(list.remove(0));
			if(list.size()==0) {
				System.out.println("삭제완료");
				break;
			}
		}

	}
}
