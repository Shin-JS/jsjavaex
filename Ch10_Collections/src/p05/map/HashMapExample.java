package p05.map;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**[List 컬렉션]
 * Map
 * -.Map컬렉션: <K,V> 형태로 객체를 저장하는 자료구조
 **/
public class HashMapExample {
	public static void main(String[] args) {
		//Map객체 생성
		Map<String,Integer> map = new HashMap<>();
		//객체 저장
		map.put("홍길동", 85);//중복키값 저장불가..., 첫번째와 4번째는 키가 "홍길동"으로 동일
		map.put("일지매", 90);//두번째값과 5번째값은 값이 90으로 동일
		map.put("임꺽정", 80);
		map.put("홍길동", 95);//이걸로 덮어씌어진듯..
		map.put("이순신", new Integer(90));
		
		System.out.println("총 저장된 Entry수: " + map.size());
		//객체출력
		Set<String> keySet = map.keySet();
		Iterator<String> itor = keySet.iterator();
		for(;itor.hasNext();) {
			String key = itor.next();
			int value = map.get(key);
			System.out.println(key+":"+value);
		}
		
		//특정위치의 객체 검색
		System.out.println("홍길동: " + map.get("홍길동")); //map.get(키)
		//특정위치의 객체 삭제
		map.remove("홍길동");
		System.out.println("총 Entry수: " + map.size());
		
		//객체 전체 삭제
		map.clear();
		System.out.println("총 Entry수: " + map.size());
		
		
	}
}
