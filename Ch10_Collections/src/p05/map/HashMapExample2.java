package p05.map;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**[List 컬렉션]
 * Map
 * -.Map컬렉션: <K,V> 형태로 객체를 저장하는 자료구조
 **/
public class HashMapExample2 {
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
		//entrySet(): Map의 Entry(키와 값이 합쳐진 객체)
		Set<Map.Entry<String,Integer>> entrySet = map.entrySet();
		Iterator<Map.Entry<String, Integer>> entryitor = entrySet.iterator();
		for(;entryitor.hasNext();) {
			Map.Entry<String, Integer> key = entryitor.next();
			String key1 = key.getKey(); //Entry에서 key추출메소드
			int value = key.getValue(); //Entry에서 value추출메소드
			System.out.println(key1+":"+value);
		}
		
		
	}
}
